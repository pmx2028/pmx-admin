package com.paramount.pmx.config;

import org.hibernate.search.backend.elasticsearch.analysis.ElasticsearchAnalysisConfigurationContext;
import org.hibernate.search.backend.elasticsearch.analysis.ElasticsearchAnalysisConfigurer;

public class HibernateSearchConfig implements ElasticsearchAnalysisConfigurer {
    @Override
    public void configure(ElasticsearchAnalysisConfigurationContext context) {
        context.analyzer("default").custom()
                .tokenizer( "whitespace" )
                .charFilters( "html_strip" )
                .tokenFilters( "lowercase", "asciifolding" )
                ;
        context.analyzer("corp").custom()
                .tokenizer( "keyword" )
                .charFilters( "html_strip" )
                .tokenFilters( "lowercase", "asciifolding" )
                ;
    }
}
