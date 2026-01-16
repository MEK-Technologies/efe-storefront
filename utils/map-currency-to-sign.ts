export type CurrencyType = "USD" | "EUR" | "GBP" | "DOP"

export function mapCurrencyToSign(currency: CurrencyType) {
  const formattedCurrency = currency.toUpperCase()
  switch (formattedCurrency) {
    case "USD":
      return "$"
    case "EUR":
      return "€"
    case "GBP":
      return "£"
    case "DOP":
      return "RD$"

    default:
      return formattedCurrency
  }
}
