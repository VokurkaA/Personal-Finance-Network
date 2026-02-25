# Datový model

## Entity

### User (Uživatel)

- id
- name
- email
- createdAt
- currency (USD, CZK, EUR)

### Account (Účet)

- id
- name (Běžný účet, Spořicí účet)
- type (checking|savings|investment|crypto)
- balance (aktuální zůstatek)
- bank (Komerční banka, Revolut)
- createdAt

### Card (Kreditní/Debetní karta)

- id
- name
- type (credit|debit)
- lastDigits (poslední 4 číslice)
- limit (limit na kartě, pro credit karty)
- linkedAccount (odkaz na účet)

### Category (Kategorie výdajů)

- id
- name (Jídlo, Transport, Zábava)
- type (expense|income)
- color (pro UI)
- budget (měsíční rozpočet, volitelně)
- parent (nadřazená kategorie – hierarchie)

### Transaction (Transakce)

- id
- date
- amount
- description
- type (expense|income|transfer)
- status (pending|completed|failed)
- metadata (venue, MCC code, atd.)

### Merchant (Obchodník/Prodejce)

- id
- name
- category (MCC)
- location (city, country)
- avgTransactionSize

### Goal (Cíl/Investice)

- id
- name (Dovolená, Auto, Penzijní fond)
- type (savings|investment|debt_payoff)
- targetAmount
- currentAmount
- deadline
- riskProfile (low|medium|high)

### BudgetPlan (Rozpočet)

- id
- month
- categories: [ { category, budgetAmount } ]
- notes

## Vztahy

- `USER --[HAS]--> ACCOUNT`
  - Atributy: primaryAccount (true/false)

- `USER --[OWNS]--> CARD`
  - (karta patří uživateli)

- `ACCOUNT --[LINKED_TO]--> CARD`
  - (karta je propojená s účtem)

- `USER --[HAS]--> CATEGORY`
  - (uživatel si vytváří své kategorie)

- `TRANSACTION --[FROM]--> ACCOUNT`
  - Atributy: date

- `TRANSACTION --[TO]--> ACCOUNT`
  - (interní transfer – peníze mezi účty)

- `TRANSACTION --[SPENT_AT]--> MERCHANT`
  - Atributy: mcc, timestamp

- `TRANSACTION --[CATEGORIZED_AS]--> CATEGORY`
  - Atributy: confidence (0–1.0 – jak jistý je AI classifier)

- `USER --[CONTRIBUTES_TO]--> GOAL`
  - Atributy: transactionHistory (seznam transakci přispívajících k cíli)

- `TRANSACTION --[CONTRIBUTES_TO]--> GOAL`
  - (když transakce přispívá k cíli, např. "Dovolená")

- `USER --[FOLLOWS_BUDGET]--> BUDGETPLAN`
  - Atributy: month, adherence (0–1.0 – jak moc se drží rozpočtu)

- `CATEGORY --[PARENT_OF]--> CATEGORY`
  - (hierarchie kategorií)

- `MERCHANT --[IN_CATEGORY]--> CATEGORY`
  - (obchodník je v kategorii – pro classification)

---

# REST API – Klíčové endpointy

## Základní CRUD

```
GET  /api/accounts
POST /api/accounts

GET  /api/cards
POST /api/cards

GET  /api/transactions
POST /api/transactions

GET  /api/goals
POST /api/goals
```

---

### Transakce – vyhledávání a filtrování

```
GET /api/transactions?startDate=2024-01-01&endDate=2024-02-01&category=food
```

- Seznam transakcí s filtry

```
GET /api/transactions/:id
```

- Detail transakce

```
POST /api/transactions/import
```

- Import CSV (např. z banky)

---

### Cashflow – tok peněz

```
GET /api/analytics/cashflow?month=2024-02
```

- Měsíční přehled: příjmy, výdaje, zůstatek

**Formát odpovědi:**

```json
{
  "income": [{ "source": "string", "amount": 0 }],
  "expenses": [{ "category": "string", "amount": 0 }],
  "netCashflow": 0,
  "changeInBalance": 0
}
```

```
GET /api/analytics/cashflow-breakdown?month=2024-02
```

- Detailní rozpad výdajů (kategorie + podkategorie)

```json
{
  "category": "string",
  "amount": 0,
  "percentage": 0,
  "subcategories": []
}
```

```
GET /api/analytics/spending-by-category?months=3
```

- Výdaje dle kategorie za poslední N měsíců

```json
[
  {
    "category": "string",
    "thisMonth": 0,
    "lastMonth": 0,
    "trend": "up | down | stable"
  }
]
```

---

# Anomálie a detekce

```
GET /api/analytics/anomalies?threshold=0.9
```

- Seznam podezřelých transakcí (outliers)
- Logika: z-score, IQR

```json
[
  {
    "transaction": {},
    "anomalyScore": 0,
    "reason": "string"
  }
]
```

---

# Goals a úspora

```
GET /api/goals/:id
```

- Detail cíle s progress

```
GET /api/goals/:id/contributions
```

- Seznam transakcí přispívajících k cíli

```
GET /api/goals/:id/forecast
```

- Prognóza dosažení cíle

```json
{
  "estimatedDate": "YYYY-MM-DD",
  "requiredMonthlyAmount": 0
}
```

---

# Doporučení

```
GET /api/recommendations/savings
```

- Analýza výdajů, identifikace redundancí

```
GET /api/recommendations/investment
```

- Na základě cílů, risk profilu, volného cash

```json
[
  {
    "asset": "string",
    "expectedReturn": 0,
    "risk": "low | medium | high",
    "reason": "string"
  }
]
```

```
GET /api/recommendations/budget-adjustment?category=food
```

- Úprava rozpočtu dle historie a trendu

---

# Rozpočet

```
GET /api/budgets/:id
```

- Detail rozpočtu s aktuálním stavem

```
GET /api/budgets/:id/vs-actual?category=all
```

- Porovnání plánovaného vs. skutečného

```json
[
  {
    "category": "string",
    "planned": 0,
    "actual": 0,
    "remaining": 0,
    "percentageUsed": 0
  }
]
```

```
POST /api/budgets
```

- Vytvoření nového rozpočtu

---

# Síťová analýza

```
GET /api/analytics/spending-flow?month=2024-02
```

- Tok peněz: income → účty → výdaje

```json
{
  "nodes": [],
  "edges": []
}
```

```
GET /api/analytics/account-flow?account=ACC_001
```

- Inflow, outflow, netFlow s detailem dle cíle/kategorie

```json
[
  {
    "inflow": 0,
    "outflow": 0,
    "netFlow": 0
  }
]
```

---

# Historické analýzy

```
GET /api/analytics/year-in-review?year=2024
```

- Roční přehled: top výdaje, úspory, cíle, trendy

```
GET /api/analytics/spending-patterns?months=6
```

- Sezonnost a opakující se výdaje

---

# Příklady API odpovědí

## Cashflow – měsíční

```json
{
  "month": "2024-02",
  "income": [
    { "source": "Plat", "amount": 60000, "account": "acc-001" },
    { "source": "Freelance", "amount": 8000, "account": "acc-001" }
  ],
  "totalIncome": 68000,
  "expenses": [
    { "category": "Bydlení", "amount": 15000, "percentage": 22.1 },
    { "category": "Jídlo", "amount": 8500, "percentage": 12.5 },
    { "category": "Transport", "amount": 3200, "percentage": 4.7 },
    { "category": "Zábava", "amount": 5400, "percentage": 7.9 }
  ],
  "totalExpenses": 32100,
  "netCashflow": 35900,
  "savingsRate": 0.528,
  "accountBalanceChange": { "from": 120000, "to": 155900 }
}
```

---

## Doporučení úspor

```json
{
  "recommendations": [
    {
      "title": "Streaming služby",
      "currentSpending": 500,
      "services": [
        { "name": "Netflix", "amount": 200 },
        { "name": "Disney+", "amount": 150 },
        { "name": "Spotify", "amount": 150 }
      ],
      "suggestion": "Disney+ a Spotify nejsou v posledních 3 měsících používány",
      "potentialSavings": 300,
      "priority": "medium"
    },
    {
      "title": "Kavárny",
      "currentSpending": 3600,
      "frequency": "denně",
      "averagePrice": 120,
      "suggestion": "Kávovar za 5000 Kč se vrátí za 1.5 měsíce",
      "potentialSavings": 2160,
      "priority": "high"
    },
    {
      "title": "Pojištění",
      "currentSpending": 2400,
      "suggestion": "Pojistka je o 300 Kč vyšší než průměr",
      "potentialSavings": 360,
      "priority": "low"
    }
  ],
  "totalPotentialSavings": 2820
}
```

---

## Anomálie – detekce podvodů

```json
{
  "anomalies": [
    {
      "transactionId": "tx-2024-04821",
      "date": "2024-02-14",
      "amount": 45000,
      "merchant": "Neznámý obchodník",
      "category": "Nákupy",
      "anomalyScore": 0.95,
      "reason": "Částka je 3.5x vyšší než průměr v kategorii",
      "location": "Kazachstán",
      "timePattern": "Nákup v 03:15 není běžný",
      "recommendation": "Ověř u banky"
    }
  ]
}
```

---

## Spending Flow – síť peněz

```json
{
  "month": "2024-02",
  "nodes": [
    { "id": "source-salary", "type": "income", "label": "Plat" },
    { "id": "acc-001", "type": "account", "label": "Běžný účet" },
    { "id": "cat-food", "type": "category", "label": "Jídlo" },
    { "id": "cat-housing", "type": "category", "label": "Bydlení" }
  ],
  "edges": [
    { "from": "source-salary", "to": "acc-001", "amount": 60000 },
    { "from": "acc-001", "to": "cat-food", "amount": 8500 },
    { "from": "acc-001", "to": "cat-housing", "amount": 15000 }
  ]
}
```