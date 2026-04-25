package com.rfq.british.enums;

public enum ExtensionTrigger {
    BID_RECEIVED("Any bid received in trigger window"),
    ANY_RANK_CHANGE("Any supplier rank change in trigger window"),
    L1_RANK_CHANGE("Lowest bidder (L1) changed in trigger window");

    private final String description;

    ExtensionTrigger(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
