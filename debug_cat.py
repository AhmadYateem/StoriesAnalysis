import pandas as pd
df = pd.read_parquet('data/cleaned/category_summary.parquet')
print(df.columns.tolist())
print(df.head(10).to_string())
print()
na = df[~df['IsAggregate']]
print(na[['Branch','Category','TrueRevenue','TotalProfit','TotalCost','ProfitMargin']].head(10).to_string())
rev = na['TrueRevenue'].sum()
profit = na['TotalProfit'].sum()
print(f"Total TrueRevenue: {rev:,.0f}")
print(f"Total Profit: {profit:,.0f}")
print(f"Margin: {profit/rev*100:.1f}%")
