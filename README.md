# Oregon Laws
Search data for Oregon laws

Based on an earlier demo by Xcential for the Constitution Annotated:
[Demo](http://ca.linkedlegislation.com)

## Quick Start (development)
1. Clone this repository
2. Initialize the UI submodule in elasticsearch-gui:
`git submodule update --init`

3. [Install Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/_installation.html). 

2. Add CORS support by adding the following lines to config/elasticsearch.yml:
```
http.cors.enabled: true
http.cors.allow-origin: "*"
```

3. Start Elasticsearch: `$./bin/elasticsearch`
4. Install python dependencies from requirements.txt (uses Python ~2.7)
5. Index the desired pdf from pdfconvert.py *More detailed instructions needed here*
    a. Update the configurations for the pdf path and the elasticsearch index
    b. run `makeOnePagers()`
    c. run `convertPages()`
    d. Convert pdf files to html using https://github.com/coolwanglu/pdf2htmlEX. Store the pdf and html directory in elasticsearch-gui
6. Update `elasticsearch-gui/javascript/Configuration-Service.js` to point to the desired index. *Update this to allow the user to select an index from the UI`

7. Serve and Run through Nginx:
    a. Install nginx
    b. Run nginx with the nginx.conf provided. This uses a proxy at `/elasticproxy` to access elasticsearch on localhost:9200.
    c. Navigate to /index.html




