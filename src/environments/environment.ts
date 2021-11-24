// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {

  production: false,
  defaultauth: '',
  url_api: '',
  microservices: {
    user: "https://dev-api.encargomio.com/api/v1/user/",
    management: "http://localhost:4004/api/v1/management/",
    orders: "https://dev-api.encargomio.com/api/v1/orders/",
    scraping: 'https://t8cjnb3q08.execute-api.us-east-1.amazonaws.com/prod/web-scrapping-page',
    updateConveyor: 'https://t8cjnb3q08.execute-api.us-east-1.amazonaws.com/prod/update-status-conveyor'
  },
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
