package com.paramount.pmx.utils;

import java.text.DecimalFormat;

public class StringUtils {
    // param string
    /* string type comma 찍기 */
	public static String getFormat(String str, String format) {
		if (format == null || format.equals("")) {
			format = "###,###,###,###";
		}

		String temp = null;

		if (str == null || str.equals("     ")) {
			temp = "0";
		} else {
			double change = Double.valueOf(str).doubleValue();
			DecimalFormat decimal = new DecimalFormat(format);
			temp = decimal.format(change);
		}

		return temp;
	}

	// param int
    /* integer type comma 찍기 */
	public static String getFormat(int istr, String format) {
		String str = Integer.toString(istr);
		if (format == null || format.equals("")) {
			format = "###,###,###,###";
		}

		String temp = null;

		if (str == null) {
			temp = "0";
		} else {
			double change = Double.valueOf(str).doubleValue();
			DecimalFormat decimal = new DecimalFormat(format);
			temp = decimal.format(change);
		}

		return temp;
	}
}
