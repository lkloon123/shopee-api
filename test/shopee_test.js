const { expect } = require("chai");
const nock = require("nock");
const ShopeeApi = require("../src/index");

nock.disableNetConnect();

describe("ShopeeApi Test", function() {
  const options = {
    partner_id: 1234567,
    partner_key: "qwertyuiop",
    redirect_uri: "http://localhost:3000",
    webhook_url: "http://localhost:3000/webhook"
  };

  it("should construct an ShopeeApi object", function() {
    const shopeeApi = new ShopeeApi({});
    expect(shopeeApi).to.be.an.instanceof(ShopeeApi);
  });

  it("should throw error if no config", function() {
    expect(function() {
      new ShopeeApi();
    }).to.throw();
  });

  it("should build auth url on called", function() {
    const shopeeApi = new ShopeeApi(options);
    const expectedUrl =
      "https://partner.shopeemobile.com/api/v1/shop/auth_partner?id=1234567&token=fcc56763cfe76d5596c90daeb8ae155b09abf9a8761f267ed2dee54ae88b7c2e&redirect=http://localhost:3000";
    const actualUrl = shopeeApi.buildAuthURL();
    expect(actualUrl).to.equal(expectedUrl);
  });

  it("should able to validate webhook signature", function() {
    const mockSignature =
      "43d0866e15622bda257475a6ad55348d1cb2c9653c2feb54cac58a19cfbb3db3";
    const mockParams = {
      msg: "some msg"
    };
    const shopeeApi = new ShopeeApi(options);
    const result = shopeeApi.isValidSignature(mockParams, mockSignature);
    expect(result).to.be.true;
  });

  it("should callback on make request", function() {
    const expectedBody = {
      msg: "testing only"
    };
    nock("https://partner.shopeemobile.com")
      .post("/api/v1/shop/get_partner_shop")
      .reply(200, expectedBody);

    return new Promise(function(resolve, reject) {
      const shopeeApi = new ShopeeApi(options);
      shopeeApi.post("/shop/get_partner_shop", {}, function(err, res, body) {
        if (err) {
          return reject(err);
        }

        expect(res.statusCode).to.equal(200);
        expect(JSON.stringify(body)).to.equal(JSON.stringify(expectedBody));
        return resolve();
      });
    });
  });

  it("should return promise on make request", function() {
    const expectedBody = {
      msg: "testing only"
    };
    nock("https://partner.shopeemobile.com")
      .post("/api/v1/shop/get_partner_shop")
      .reply(200, expectedBody);

    const shopeeApi = new ShopeeApi(options);
    return shopeeApi
      .post("/shop/get_partner_shop", {})
      .then(function({ body, res }) {
        expect(res.statusCode).to.equal(200);
        expect(JSON.stringify(body)).to.equal(JSON.stringify(expectedBody));
      });
  });

  it("should return error callback when error", function() {
    const expectedBody = {
      msg: "error msg"
    };
    nock("https://partner.shopeemobile.com")
      .post("/api/v1/shop/get_partner_shop")
      .replyWithError(expectedBody);

    return new Promise(function(resolve, reject) {
      const shopeeApi = new ShopeeApi(options);
      shopeeApi.post("/shop/get_partner_shop", {}, function(err, res, body) {
        if (err) {
          return resolve();
        }

        return reject("err not being called");
      });
    });
  });

  it("should return error promise when error", function() {
    const expectedBody = {
      msg: "error msg"
    };
    nock("https://partner.shopeemobile.com")
      .post("/api/v1/shop/get_partner_shop")
      .replyWithError(expectedBody);

    const shopeeApi = new ShopeeApi(options);
    return new Promise(function(resolve, reject) {
      shopeeApi
        .post("/shop/get_partner_shop", {})
        .then(function() {
          return reject("err not being called");
        })
        .catch(function() {
          return resolve();
        });
    });
  });
});
