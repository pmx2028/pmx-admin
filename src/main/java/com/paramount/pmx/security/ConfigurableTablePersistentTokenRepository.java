package com.paramount.pmx.security;

import org.apache.commons.lang3.StringUtils;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.web.authentication.rememberme.PersistentRememberMeToken;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.util.Date;
import java.util.regex.Pattern;

public class ConfigurableTablePersistentTokenRepository implements PersistentTokenRepository {

    private static final Pattern TABLE_NAME_PATTERN = Pattern.compile("[A-Za-z0-9_.$]+");

    private final JdbcTemplate jdbcTemplate;
    private final String tableName;

    public ConfigurableTablePersistentTokenRepository(DataSource dataSource, String tableName) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
        this.tableName = validateTableName(tableName);
    }

    @Override
    public void createNewToken(PersistentRememberMeToken token) {
        jdbcTemplate.update(
                "insert into " + tableName + " (username, series, token, last_used) values (?, ?, ?, ?)",
                token.getUsername(),
                token.getSeries(),
                token.getTokenValue(),
                new Timestamp(token.getDate().getTime())
        );
    }

    @Override
    public void updateToken(String series, String tokenValue, Date lastUsed) {
        jdbcTemplate.update(
                "update " + tableName + " set token = ?, last_used = ? where series = ?",
                tokenValue,
                new Timestamp(lastUsed.getTime()),
                series
        );
    }

    @Override
    public PersistentRememberMeToken getTokenForSeries(String seriesId) {
        try {
            return jdbcTemplate.queryForObject(
                    "select username, series, token, last_used from " + tableName + " where series = ?",
                    (rs, rowNum) -> new PersistentRememberMeToken(
                            rs.getString("username"),
                            rs.getString("series"),
                            rs.getString("token"),
                            rs.getTimestamp("last_used")
                    ),
                    seriesId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    @Override
    public void removeUserTokens(String username) {
        jdbcTemplate.update("delete from " + tableName + " where username = ?", username);
    }

    private String validateTableName(String tableName) {
        if (StringUtils.isBlank(tableName) || !TABLE_NAME_PATTERN.matcher(tableName).matches()) {
            throw new IllegalArgumentException("Invalid remember-me table name: " + tableName);
        }
        return tableName;
    }
}
