package com.paramount.pmx.logging;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.filter.Filter;
import ch.qos.logback.core.spi.FilterReply;

public class MdcFilter extends Filter<ILoggingEvent> {

    private String mdcKey;
    private String mdcValue;
    private boolean acceptOnMatch = true;

    @Override
    public FilterReply decide(ILoggingEvent event) {
        String value = event.getMDCPropertyMap().get(mdcKey);
        boolean matches = mdcValue.equals(value);

        if (matches) {
            return acceptOnMatch ? FilterReply.ACCEPT : FilterReply.DENY;
        } else {
            return acceptOnMatch ? FilterReply.DENY : FilterReply.NEUTRAL;
        }
    }

    public void setMdcKey(String mdcKey) { this.mdcKey = mdcKey; }
    public void setMdcValue(String mdcValue) { this.mdcValue = mdcValue; }
    public void setAcceptOnMatch(boolean acceptOnMatch) { this.acceptOnMatch = acceptOnMatch; }
}
