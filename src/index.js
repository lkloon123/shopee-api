const crypto = require("crypto");
const request = require("request");

class ShopeeApi {
  constructor(config) {
    if (config === null || config === undefined) {
      throw new Error("config required");
    }

    this.config = config;

    if (this.config.partner_id) {
      if (
        typeof this.config.partner_id === "string" ||
        this.config.partner_id instanceof String
      ) {
        this.config.partner_id = Number(this.config.partner_id);
      }
    }

    if (this.config.verbose !== true) {
      this.config.verbose = false;
    }
  }

  getBaseUrl() {
    return `https://partner${
      this.config.isUAT ? ".uat" : ""
    }.shopeemobile.com/api/v1`;
  }

  buildAuthURL(isCancel = false) {
    const token = crypto
      .createHash("sha256")
      .update(this.config.partner_key + this.config.redirect_uri)
      .digest("hex");

    let authUrl = `${this.getBaseUrl()}/shop/`;
    authUrl += isCancel ? "cancel_auth_partner" : "auth_partner";
    authUrl += `?id=${this.config.partner_id}`;
    authUrl += `&token=${token}`;
    authUrl += `&redirect=${this.config.redirect_uri}`;
    return authUrl;
  }

  buildCancelAuthUrl() {
    return this.buildAuthURL(true);
  }

  generateAuthorization(path, data) {
    const message = `${this.getBaseUrl() + path}|${data}`;
    return crypto
      .createHmac("sha256", this.config.partner_key)
      .update(message)
      .digest("hex");
  }

  verboseLog(msg) {
    if (this.config.verbose) {
      console.log(msg);
    }
  }

  isValidSignature(params, signature) {
    const message = `${this.config.webhook_url}|${params}`;

    const digest = crypto
      .createHmac("sha256", this.config.partner_key)
      .update(message)
      .digest("hex");

    return digest === signature;
  }

  makeRequest(endpoint, data, method, callback = null) {
    const cloneData = data === null || data === undefined ? {} : data;
    cloneData.partner_id = this.config.partner_id;
    cloneData.timestamp = Math.floor(new Date() / 1000);
    if (this.config.shopid) {
      cloneData.shopid = this.config.shopid;
    }

    const self = this;
    const options = {
      baseUrl: this.getBaseUrl(),
      uri: endpoint,
      method: method.toUpperCase() || "POST",
      headers: {
        Authorization: this.generateAuthorization(
          endpoint,
          JSON.stringify(data)
        )
      },
      qs: method.toUpperCase() === "GET" ? data : {},
      json: method.toUpperCase() !== "GET" ? data : {}
    };

    const promise = new Promise(function(resolve, reject) {
      request(options, function(err, res, body) {
        if (err) {
          self.verboseLog(`ERROR: ${err}`);
          return reject(err);
        }

        self.verboseLog(`STATUS: ${res.statusCode}`);
        self.verboseLog(`HEADERS: ${JSON.stringify(res.headers)}`);
        self.verboseLog(`BODY: ${JSON.stringify(body)}`);
        return resolve({ body, res });
      });
    });

    if (callback === null) {
      return promise;
    }

    return promise
      .then(function({ body, res }) {
        return callback(null, res, body);
      })
      .catch(function(err) {
        return callback(err, null, null);
      });
  }

  post(endpoint, data = null, callback = null) {
    return this.makeRequest(endpoint, data, "POST", callback);
  }
}

module.exports = ShopeeApi;
