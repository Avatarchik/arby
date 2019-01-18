const Wallet = {
    "id": "/Wallet",
    "type": "string",
    "enum": [
        "UK"
    ]
};

const IncludeItem = {
    "id": "/IncludeItem",
    "type": "string",
    "enum": [
        "ALL",
        "DEPOSITS_WITHDRAWALS",
        "EXCHANGE",
        "POKER_ROOM"
    ]
};

export default {
    Wallet,
    IncludeItem
};