// package com.dealsite.backoffice.utils;

// import org.apache.lucene.analysis.Analyzer;
// import org.apache.lucene.analysis.TokenStream;
// import org.apache.lucene.analysis.Tokenizer;
// import org.apache.lucene.analysis.core.LowerCaseFilter;
// import org.apache.lucene.analysis.core.WhitespaceTokenizer;

// public class HibernateSearchAnalyzerUtils extends Analyzer {

//     @Override
//     protected TokenStreamComponents createComponents(final String fieldName) {
//         Tokenizer source = new WhitespaceTokenizer();
//         TokenStream filter = new LowerCaseFilter(source);
//         return new TokenStreamComponents(source, filter);
//     }
// }