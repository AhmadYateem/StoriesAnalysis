"""
Stories Coffee — Data Cleaning Pipeline
========================================
Parses all 4 raw POS CSV exports into clean, analysis-ready DataFrames.
Handles page headers, hierarchical structures, branch normalization,
and the Total Price truncation bug.

Usage:
    from data_cleaning import load_all_data
    data = load_all_data()  # Returns dict of DataFrames
    # data['monthly_sales'], data['product_profitability'],
    # data['sales_by_group'], data['category_summary']
"""

import pandas as pd
import numpy as np
import re
import os
import csv
import io
import warnings
warnings.filterwarnings('ignore')


def csv_split(line):
    """Split a CSV line properly handling quoted fields with commas.

    The POS system exports contain fields like '"1,234"' where a naive
    str.split(',') would break numeric values.  We delegate to Python's
    csv.reader which respects RFC 4180 quoting rules.
    """
    try:
        reader = csv.reader(io.StringIO(line))
        return next(reader)
    except StopIteration:
        return []

# ============================================================
# BRANCH NAME NORMALIZATION
# ============================================================
# The 4 raw CSV files use 26 inconsistent branch name variants
# (mixed case, dots, abbreviations).  This lookup table maps every
# observed variant to one canonical name per physical location.
BRANCH_NAME_MAP = {
    "Stories - Bir Hasan": "Stories Bir Hasan",
    "Stories Bir Hasan": "Stories Bir Hasan",
    "Stories Ain El Mreisseh": "Stories Ain El Mreisseh",
    "Stories Airport": "Stories Airport",
    "Stories Antelias": "Stories Antelias",
    "Stories Batroun": "Stories Batroun",
    "Stories Bayada": "Stories Bayada",
    "Stories Centro Mall": "Stories Centro Mall",
    "Stories Event Starco": "Stories Event Starco",
    "Stories Faqra": "Stories Faqra",
    "Stories Khaldeh": "Stories Khaldeh",
    "Stories LAU": "Stories LAU",
    "Stories Le Mall": "Stories Le Mall",
    "Stories Mansourieh": "Stories Mansourieh",
    "Stories Ramlet El Bayda": "Stories Ramlet El Bayda",
    "Stories Saida": "Stories Saida",
    "Stories Sour 2": "Stories Sour 2",
    "Stories Verdun": "Stories Verdun",
    "Stories Zalka": "Stories Zalka",
    "Stories alay": "Stories Aley",
    "Stories amioun": "Stories Amioun",
    "Stories jbeil": "Stories Jbeil",
    "Stories kaslik": "Stories Kaslik",
    "Stories raouche": "Stories Raouche",
    "Stories sin el fil": "Stories Sin El Fil",
    "Stories.": "Stories Unknown (Closed)",
}

REGION_MAP = {
    "Stories Ain El Mreisseh": "Beirut Central",
    "Stories Verdun": "Beirut Central",
    "Stories Raouche": "Beirut Central",
    "Stories Ramlet El Bayda": "Beirut Central",
    "Stories Bayada": "Beirut Central",
    "Stories Sin El Fil": "Greater Beirut",
    "Stories Bir Hasan": "Greater Beirut",
    "Stories Khaldeh": "Greater Beirut",
    "Stories Mansourieh": "Greater Beirut",
    "Stories Batroun": "North",
    "Stories Amioun": "North",
    "Stories Jbeil": "North",
    "Stories Antelias": "Metn",
    "Stories Zalka": "Metn",
    "Stories Kaslik": "Metn",
    "Stories Saida": "South",
    "Stories Sour 2": "South",
    "Stories Faqra": "Mountains",
    "Stories Aley": "Mountains",
    "Stories Centro Mall": "Malls & Special",
    "Stories Le Mall": "Malls & Special",
    "Stories LAU": "Malls & Special",
    "Stories Airport": "Malls & Special",
    "Stories Event Starco": "Malls & Special",
    "Stories Unknown (Closed)": "Unknown",
}


def normalize_branch(name):
    """Normalize branch name using the mapping."""
    if not isinstance(name, str):
        return name
    name = name.strip()
    return BRANCH_NAME_MAP.get(name, name)


def get_region(branch_name):
    """Get region for a normalized branch name."""
    return REGION_MAP.get(branch_name, "Unknown")


def is_page_header(line):
    """Detect POS report page headers."""
    if not isinstance(line, str):
        return False
    # Match date patterns like "22-Jan-26" or "19-Jan-26"
    if re.match(r'^\d{1,2}-\w{3}-\d{2}', line):
        return True
    # Match column header rows
    if line.startswith('Product Desc,') or line.startswith('Description,') or line.startswith('Category,'):
        return True
    return False


def parse_number(val):
    """Parse a number string with commas into float."""
    if pd.isna(val) or val == '' or val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    val = str(val).strip().replace(',', '')
    try:
        return float(val)
    except ValueError:
        return 0.0


# ============================================================
# FILE 1: Monthly Sales (REP_S_00134_SMRY.csv)
# ============================================================
def parse_monthly_sales(filepath):
    """
    Parse the Comparative Monthly Sales report.
    Returns DataFrame with columns:
    [Year, Branch, Jan-Dec monthly values, Total_By_Year, Region]
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    records = []
    current_year = None
    months = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Skip report headers
        if line.startswith('Stories,') and 'Stories ' not in csv_split(line)[1]:
            continue
        if 'Comparative Monthly' in line or 'Page ' in line:
            continue
        if line.startswith(',,,') and ('January' in line or 'October' in line):
            continue

        parts = [p.strip() for p in csv_split(line)]

        # Detect year row
        if parts[0] in ('2025', '2026'):
            current_year = int(parts[0])
            # This row also has branch data
            branch_name = parts[1] if len(parts) > 1 else ''
            if branch_name and branch_name != 'Total':
                values = parts[2:]  # remaining are month values or total
                record = {'Year': current_year, 'Branch_Raw': branch_name}
                records.append((record, values))
            elif branch_name == 'Total':
                record = {'Year': current_year, 'Branch_Raw': 'Total'}
                records.append((record, parts[2:]))
            continue

        # Continuation rows (year carried over)
        if parts[0] == '' and len(parts) > 1 and parts[1]:
            branch_name = parts[1]
            values = parts[2:]
            if current_year and branch_name:
                record = {'Year': current_year, 'Branch_Raw': branch_name}
                records.append((record, values))
            continue

    # --- Two-pass assembly ---
    # The POS export splits each branch across two CSV "pages":
    #   Page 1 → Jan through Sep (up to 9 values)
    #   Page 2 → Oct through Dec + Total_By_Year (up to 4 values)
    # We merge both pages by keying on (year, branch).
    branch_data = {}  # key = (year, branch), value = list of 13 floats

    for record, values in records:
        key = (record['Year'], record['Branch_Raw'])
        if key not in branch_data:
            branch_data[key] = [0.0] * 13  # 12 months + total

        # Parse numeric values
        nums = [parse_number(v) for v in values if v.strip() != '']

        # Determine which months these values correspond to
        existing = branch_data[key]
        # Count how many non-zero values already exist
        filled = sum(1 for x in existing[:12] if x != 0.0)

        if filled == 0:
            # First batch: Jan-Sep (up to 9 values)
            for i, n in enumerate(nums[:9]):
                existing[i] = n
        else:
            # Second batch: Oct-Dec + Total (up to 4 values)
            for i, n in enumerate(nums[:3]):
                existing[9 + i] = n
            if len(nums) >= 4:
                existing[12] = nums[3]  # Total By Year

    # Build DataFrame
    rows = []
    for (year, branch_raw), vals in branch_data.items():
        branch = normalize_branch(branch_raw)
        row = {
            'Year': year,
            'Branch': branch,
            'Branch_Raw': branch_raw,
            'Region': get_region(branch),
        }
        for i, m in enumerate(months):
            row[m] = vals[i]
        row['Total_By_Year'] = vals[12]
        rows.append(row)

    df = pd.DataFrame(rows)
    # Remove 'Total' rows
    df = df[df['Branch'] != 'Total'].reset_index(drop=True)

    # Fix: if Total_By_Year is 0, compute from months
    mask = df['Total_By_Year'] == 0
    df.loc[mask, 'Total_By_Year'] = df.loc[mask, months].sum(axis=1)

    return df


# ============================================================
# FILE 2: Product Profitability (rep_s_00014_SMRY.csv)
# ============================================================
def parse_product_profitability(filepath):
    """
    Parse hierarchical product profitability data.
    Returns DataFrame with columns:
    [Branch, ServiceType, Category, Section, Product, Qty, TotalPrice,
     TotalCost, CostPct, TotalProfit, ProfitPct, TrueRevenue, IsAggregate]
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    records = []
    current_branch = None
    current_service = None
    current_category = None
    current_section = None

    # Known branch names (from the data)
    known_branches = set(BRANCH_NAME_MAP.keys())
    # Service types
    service_types = {'TAKE AWAY', 'TABLE', 'Toters'}
    # Categories
    categories = {'BEVERAGES', 'FOOD'}

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Skip page headers
        if re.match(r'^\d{1,2}-\w{3}-\d{2}', line):
            continue
        if line.startswith('Product Desc,Qty'):
            continue
        if line.startswith('Stories,,,') and current_branch is None:
            continue
        if 'Theoretical Profit' in line:
            continue
        if 'Copyright' in line or 'omegapos' in line.lower():
            continue

        parts = [p.strip() for p in csv_split(line)]
        first = parts[0].strip()

        # Detect branch
        if first in known_branches:
            current_branch = first
            current_service = None
            current_category = None
            current_section = None
            continue

        # Detect service type
        if first in service_types:
            current_service = first
            current_category = None
            current_section = None
            continue

        # Detect category
        if first in categories:
            current_category = first
            current_section = None
            continue

        # Detect section (ends with SECTION, ROLLS, etc. or is a known division)
        section_patterns = [
            'SECTION', 'ROLLS', 'PASTRY', 'COOKIES', 'CROISSANT', 'YOGHURT',
            'DONUTS', 'SANDWICHES', 'SUBS', 'OFFER', 'SALADS BAR', 'CARTON',
            'NOT USED', 'HEALTHY', 'POP UP', 'GRAB'
        ]
        if any(pat in first.upper() for pat in section_patterns) and len(parts) < 3:
            current_section = first
            continue
        # Also handle exact matches
        if first in ['CINNAMON ROLLS', 'FRENCH PASTRY', 'COFFEE PASTRY', 'FROZEN YOGHURT']:
            current_section = first
            continue

        # Skip total/aggregate rows but capture them
        is_aggregate = False
        if first.startswith('Total By') or first.startswith('Total by'):
            is_aggregate = True

        # Parse product data rows (need at least qty and some financial data)
        if len(parts) >= 8:
            qty = parse_number(parts[1])
            total_price = parse_number(parts[2])
            # parts[3] is empty spacer
            total_cost = parse_number(parts[4])
            cost_pct = parse_number(parts[5])
            total_profit = parse_number(parts[6])
            # parts[7] is empty spacer
            profit_pct = parse_number(parts[8]) if len(parts) > 8 else 0.0

            # Skip rows with all zeros and no meaningful product name
            if qty == 0 and total_price == 0 and total_cost == 0 and total_profit == 0 and not is_aggregate:
                continue

            # Compute true revenue — critical data quality fix.
            # The POS truncates TotalPrice at large values (overflow bug).
            # For aggregate rows, TotalPrice is ALWAYS unreliable.
            # TrueRevenue = TotalCost + TotalProfit is algebraically exact.
            if is_aggregate:
                true_revenue = total_cost + total_profit
            else:
                true_revenue = total_price if total_price > 0 else (total_cost + total_profit)

            records.append({
                'Branch_Raw': current_branch,
                'Branch': normalize_branch(current_branch) if current_branch else None,
                'ServiceType': current_service,
                'Category': current_category,
                'Section': current_section,
                'Product': first,
                'Qty': qty,
                'TotalPrice': total_price,
                'TotalCost': total_cost,
                'CostPct': cost_pct,
                'TotalProfit': total_profit,
                'ProfitPct': profit_pct,
                'TrueRevenue': true_revenue,
                'IsAggregate': is_aggregate,
            })

    df = pd.DataFrame(records)
    if len(df) > 0:
        df['Region'] = df['Branch'].map(get_region)
        # Filter out aggregate rows for product-level analysis
        df['UnitProfit'] = np.where(df['Qty'] > 0, df['TotalProfit'] / df['Qty'], 0)
        df['UnitRevenue'] = np.where(df['Qty'] > 0, df['TrueRevenue'] / df['Qty'], 0)
        df['UnitCost'] = np.where(df['Qty'] > 0, df['TotalCost'] / df['Qty'], 0)

    return df


# ============================================================
# FILE 3: Sales by Product Groups (rep_s_00191_SMRY-3.csv)
# ============================================================
def parse_sales_by_group(filepath):
    """
    Parse sales by product group data.
    Returns DataFrame with columns:
    [Branch, Division, Group, Product, Barcode, Qty, TotalAmount, IsAggregate]
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    records = []
    current_branch = None
    current_division = None
    current_group = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Skip page headers
        if re.match(r'^\d{1,2}-\w{3}-\d{2}', line):
            continue
        if line.startswith('Description,Barcode'):
            continue
        if line.startswith('Stories,,,,') or line.startswith('Sales by Items'):
            continue
        if 'Copyright' in line or 'omegapos' in line.lower():
            continue

        parts = [p.strip() for p in csv_split(line)]
        first = parts[0].strip()

        # Detect branch
        if first.startswith('Branch:'):
            current_branch = first.replace('Branch:', '').strip()
            current_division = None
            current_group = None
            continue

        # Detect division
        if first.startswith('Division:'):
            current_division = first.replace('Division:', '').strip()
            current_group = None
            continue

        # Detect group
        if first.startswith('Group:'):
            current_group = first.replace('Group:', '').strip()
            continue

        # Detect total rows
        is_aggregate = False
        agg_level = None
        if first.startswith('Total by Group:'):
            is_aggregate = True
            agg_level = 'Group'
        elif first.startswith('Total by Division:'):
            is_aggregate = True
            agg_level = 'Division'
        elif first.startswith('Total by Branch:'):
            is_aggregate = True
            agg_level = 'Branch'

        # Parse product rows
        if len(parts) >= 4:
            barcode = parts[1] if len(parts) > 1 else ''
            qty = parse_number(parts[2]) if len(parts) > 2 else 0.0
            total_amount = parse_number(parts[3]) if len(parts) > 3 else 0.0

            if qty == 0 and total_amount == 0 and not is_aggregate:
                continue

            records.append({
                'Branch_Raw': current_branch,
                'Branch': normalize_branch(current_branch) if current_branch else None,
                'Division': current_division,
                'Group': current_group,
                'Product': first,
                'Barcode': barcode,
                'Qty': qty,
                'TotalAmount': total_amount,
                'IsAggregate': is_aggregate,
                'AggLevel': agg_level,
            })

    df = pd.DataFrame(records)
    if len(df) > 0:
        df['Region'] = df['Branch'].map(get_region)
    return df


# ============================================================
# FILE 4: Category Profit Summary (rep_s_00673_SMRY.csv)
# ============================================================
def parse_category_summary(filepath):
    """
    Parse category-level profit summary by branch.
    Returns DataFrame with columns:
    [Branch, Category, Qty, TotalPrice, TotalCost, CostPct,
     TotalProfit, ProfitPct, TrueRevenue, IsAggregate]
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    records = []
    current_branch = None
    known_branches = set(BRANCH_NAME_MAP.keys())

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Skip headers
        if re.match(r'^\d{1,2}-\w{3}-\d{2}', line):
            continue
        if line.startswith('Category,Qty'):
            continue
        if line.startswith('Stories,,,') and 'Theoretical' not in line:
            continue
        if 'Theoretical Profit' in line or 'Copyright' in line or 'omegapos' in line.lower():
            continue

        parts = [p.strip() for p in csv_split(line)]
        first = parts[0].strip()

        # Detect branch
        if first in known_branches:
            current_branch = first
            continue

        # Detect category rows or total rows
        is_aggregate = 'Total By Branch' in first

        if first in ('BEVERAGES', 'FOOD') or is_aggregate:
            if len(parts) >= 8:
                qty = parse_number(parts[1])
                total_price = parse_number(parts[2])
                total_cost = parse_number(parts[4])
                cost_pct = parse_number(parts[5])
                total_profit = parse_number(parts[6])
                profit_pct = parse_number(parts[8]) if len(parts) > 8 else 0.0

                true_revenue = total_cost + total_profit  # Always use this due to bug

                records.append({
                    'Branch_Raw': current_branch,
                    'Branch': normalize_branch(current_branch) if current_branch else None,
                    'Category': first if not is_aggregate else 'TOTAL',
                    'Qty': qty,
                    'TotalPrice': total_price,
                    'TotalCost': total_cost,
                    'CostPct': cost_pct,
                    'TotalProfit': total_profit,
                    'ProfitPct': profit_pct,
                    'TrueRevenue': true_revenue,
                    'IsAggregate': is_aggregate,
                })

    df = pd.DataFrame(records)
    if len(df) > 0:
        df['Region'] = df['Branch'].map(get_region)
        df['ProfitMargin'] = np.where(df['TrueRevenue'] > 0,
                                       df['TotalProfit'] / df['TrueRevenue'] * 100, 0)
    return df


# ============================================================
# MASTER LOADER
# ============================================================
def find_data_dir():
    """Find the Stories_data directory."""
    possible = [
        'Stories_data',
        'Archive/Stories_data',
        os.path.join(os.path.dirname(__file__), 'Stories_data'),
        os.path.join(os.path.dirname(__file__), 'Archive', 'Stories_data'),
    ]
    for p in possible:
        if os.path.isdir(p):
            return p
    raise FileNotFoundError("Cannot find Stories_data/ directory. Place CSV files in Stories_data/ folder.")


def load_all_data(data_dir=None, use_cache=True):
    """
    Load and clean all 4 data files.

    Parameters:
        data_dir: Path to Stories_data/ folder. Auto-detected if None.
        use_cache: If True, use cached parquet files from data/cleaned/

    Returns:
        dict with keys: 'monthly_sales', 'product_profitability',
                       'sales_by_group', 'category_summary'
    """
    cache_dir = os.path.join(os.path.dirname(__file__) or '.', 'data', 'cleaned')

    if use_cache and os.path.isdir(cache_dir):
        try:
            data = {
                'monthly_sales': pd.read_parquet(os.path.join(cache_dir, 'monthly_sales.parquet')),
                'product_profitability': pd.read_parquet(os.path.join(cache_dir, 'product_profitability.parquet')),
                'sales_by_group': pd.read_parquet(os.path.join(cache_dir, 'sales_by_group.parquet')),
                'category_summary': pd.read_parquet(os.path.join(cache_dir, 'category_summary.parquet')),
            }
            print("✅ Loaded cached data from data/cleaned/")
            return data
        except Exception:
            pass  # Fall through to re-parse

    if data_dir is None:
        data_dir = find_data_dir()

    print(f"📂 Parsing raw CSV files from {data_dir}...")

    # Parse all 4 files
    monthly = parse_monthly_sales(os.path.join(data_dir, 'REP_S_00134_SMRY.csv'))
    print(f"  ✅ Monthly Sales: {len(monthly)} rows ({monthly['Branch'].nunique()} branches)")

    products = parse_product_profitability(os.path.join(data_dir, 'rep_s_00014_SMRY.csv'))
    print(f"  ✅ Product Profitability: {len(products)} rows ({products['Branch'].nunique()} branches)")

    groups = parse_sales_by_group(os.path.join(data_dir, 'rep_s_00191_SMRY-3.csv'))
    print(f"  ✅ Sales by Group: {len(groups)} rows ({groups['Branch'].nunique()} branches)")

    categories = parse_category_summary(os.path.join(data_dir, 'rep_s_00673_SMRY.csv'))
    print(f"  ✅ Category Summary: {len(categories)} rows ({categories['Branch'].nunique()} branches)")

    # Cache to parquet
    os.makedirs(cache_dir, exist_ok=True)
    monthly.to_parquet(os.path.join(cache_dir, 'monthly_sales.parquet'), index=False)
    products.to_parquet(os.path.join(cache_dir, 'product_profitability.parquet'), index=False)
    groups.to_parquet(os.path.join(cache_dir, 'sales_by_group.parquet'), index=False)
    categories.to_parquet(os.path.join(cache_dir, 'category_summary.parquet'), index=False)
    print(f"\n💾 Cached cleaned data to {cache_dir}/")

    return {
        'monthly_sales': monthly,
        'product_profitability': products,
        'sales_by_group': groups,
        'category_summary': categories,
    }


def load_uploaded_data(files_dict):
    """
    Load data from uploaded file objects (for Streamlit).

    Parameters:
        files_dict: dict mapping file key to file-like object:
            'monthly_sales' -> uploaded file
            'product_profitability' -> uploaded file
            'sales_by_group' -> uploaded file
            'category_summary' -> uploaded file
    """
    import tempfile
    results = {}

    parsers = {
        'monthly_sales': ('REP_S_00134', parse_monthly_sales),
        'product_profitability': ('rep_s_00014', parse_product_profitability),
        'sales_by_group': ('rep_s_00191', parse_sales_by_group),
        'category_summary': ('rep_s_00673', parse_category_summary),
    }

    for key, (pattern, parser) in parsers.items():
        for fname, fobj in files_dict.items():
            if pattern.lower() in fname.lower():
                # Write to temp file and parse
                with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False,
                                                  encoding='utf-8') as tmp:
                    content = fobj.read()
                    if isinstance(content, bytes):
                        content = content.decode('utf-8')
                    tmp.write(content)
                    tmp_path = tmp.name
                try:
                    results[key] = parser(tmp_path)
                finally:
                    os.unlink(tmp_path)
                break

    return results


def validate_data(data):
    """Validate parsed data and print summary."""
    print("\n" + "="*60)
    print("DATA VALIDATION REPORT")
    print("="*60)

    for name, df in data.items():
        print(f"\n📊 {name}")
        print(f"   Rows: {len(df)}")
        print(f"   Columns: {list(df.columns)}")
        if 'Branch' in df.columns:
            branches = df['Branch'].nunique()
            print(f"   Unique Branches: {branches}")
            if branches < 25:
                missing = set(BRANCH_NAME_MAP.values()) - set(df['Branch'].unique())
                print(f"   ⚠️  Missing branches: {missing}")
        print(f"   Null counts:\n{df.isnull().sum().to_string()}")

    # Cross-validation
    if 'monthly_sales' in data and 'category_summary' in data:
        ms_branches = set(data['monthly_sales']['Branch'].unique())
        cs_branches = set(data['category_summary']['Branch'].unique())
        if ms_branches == cs_branches:
            print("\n✅ Branch lists match across File 1 and File 4")
        else:
            print(f"\n⚠️  Branch mismatch: {ms_branches.symmetric_difference(cs_branches)}")

    print("\n" + "="*60)
    print("VALIDATION COMPLETE")
    print("="*60)


# ============================================================
# MAIN — Run standalone to parse & validate
# ============================================================
if __name__ == '__main__':
    data = load_all_data(use_cache=False)
    validate_data(data)
