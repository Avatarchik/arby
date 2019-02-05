const Order = {
    "id": "/Order",
    "type": "string",
    "enum": [
        "name asc",
        "name desc",
        "id asc",
        "id desc"
    ]
};

const ExchangeType = {
    "id": "/ExchangeType",
    "type": "string",
    "enum": [
        "back-lay",
        "binary"
    ]
};

const States = {
    "id": "/States",
    "type": "string",
    "enum": [
        "open",
        "suspended",
        "closed",
        "graded"
    ]
}

const OddsType = {
    "id": "/OddsType",
    "type": "string",
    "enum": [
        "DECIMAL",
        "UK",
        "HK",
        "MALAY",
        "INDO",
        "%"
    ]
};

const PriceMode = {
    "id": "/PriceMode",
    "type": "string",
    "enum": [
        "expanded",
        "aggregated"
    ]
};

const Side = {
    "id": "/Side",
    "type": "string",
    "enum": [
        "back",
        "lay",
        "win",
        "lose"
    ]
};

const Currency = {
    "id": "/Currency",
    "type": "string",
    "enum": [
        "USD",
        "GBP",
        "EUR",
        "AUD",
        "CAD",
        "HKD"
    ]
};

export default {
    Order,
    ExchangeType,
    OddsType,
    PriceMode,
    Side,
    Currency
};