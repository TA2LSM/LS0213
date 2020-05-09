const fs = require("fs"); //file-system module included
const http = require("http");
const url = require("url");

/*----------------------------------------*/
// SERVER
const replaceTemplate = (temp, product) => {
  // /../g means global. all place holders will get replaced
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  }

  return output;
};

// Top level code. Works once at the beginning...
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data); //convert data from json file to java script opject

const server = http.createServer((req, res) => {
  //console.log(req);
  //console.log(req.url); //ana url'den sonra gelen parametre kısmını parse eder
  //console.log(url.parse(req.url, true)); // true is for to parse queryString

  // query and pathname have exactly the same names in the req.url structure
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    // if there is no {} after => automatically returns value after =>
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    //console.log(cardsHtml);
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);

    // Product page
  } else if (pathname === "/product") {
    //console.log(query);
    res.writeHead(200, { "Content-type": "text/html" });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.end(output);
    //res.end("Product Section...");

    // API page
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" }); //tell the browser for application type json. Code 200 means ok.
    res.end(data);

    // Not found
  } else {
    // these codes below must be written before res.end !!!
    res.writeHead(404, {
      "Content-type": "text/html",
      "My-own-header": "Hello World!",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

//Local host, 8000 port
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port: 8000");
});
