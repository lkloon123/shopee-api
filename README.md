# Shopee Api
[![npm version](https://img.shields.io/npm/v/shopee-api.svg)](https://www.npmjs.com/package/shopee-api)
[![build status](https://img.shields.io/travis/com/lkloon123/shopee-api.svg)](https://travis-ci.com/lkloon123/shopee-api)
[![codecov](https://img.shields.io/codecov/c/github/lkloon123/shopee-api.svg)](https://codecov.io/gh/lkloon123/shopee-api)
[![license](https://img.shields.io/npm/l/shopee-api.svg)](https://www.npmjs.com/package/shopee-api)
[![total downloads](https://img.shields.io/npm/dt/shopee-api.svg)](https://www.npmjs.com/package/shopee-api)

A simple wrapper for [Shopee Open Platform](https://open.shopee.com/)
 
## Installation

```bash
npm install shopee-api
```

## Usage

Create a `ShopeeApi` Object to get started
```javascript
const ShopeeApi = require('shopee-api');

const shopeeApi = new ShopeeApi({
    isUAT: false,
    shopid: 'YOUR_SHOP_ID',
    partner_id: 'YOUR_PARTNER_ID',
    partner_key: 'YOUR_PARTNER_KEY',
    redirect_uri: 'http://localhost:3000/callback', // callback url when perform OAuth
    webhook_url: 'http://localhost:3000/webhook',
    verbose: false // show more logs
});
```

## API

#### Build Oauth Url

```javascript
const authUrl = shopeeApi.buildAuthURL();

//then u can redirect user to this url for authentication
res.redirect(authUrl);
```

#### Make calls

This package build all the required authorization in the scene behind.  
Refer [request](https://github.com/request/request) package for callback params.

```javascript
shopeeApi.post('/shop/get_partner_shop', {}, function (err, res, body) {
    if(err) {
        throw new Error(err);
    }
    
    console.log(body);
});
```

This package also return `promise` instead of callback

```javascript
shopeeApi.post('/shop/get_partner_shop', {})
    .then(function({body, res}) {
      console.log(body);
    })
    .catch(function(err) {
      console.log(err);
    });
```

#### Verify webhook request

This package can build hmac and verify it for you

```javascript
const isValid = shopeeApi.isValidSignature(req.body, req.headers.authorization);

console.log(isValid) // true if equal, false otherwise
```

## Documentation

Kindly visit [Official Shopee Docs](https://open.shopee.com/documents) for more info

## Contributing

If you want to contribute to a project and make it better, your help is very welcome. Just send a pr and you are all set.

## License

This library is released under the [MIT License](LICENSE)
