(function () {
  (self["webpackChunkencargomio_backoffice"] = self["webpackChunkencargomio_backoffice"] || []).push([["common"], {
    /***/
    64256:
    /*!***********************************************!*\
      !*** ./src/app/_helpers/tools/header.tool.ts ***!
      \***********************************************/

    /***/
    function _(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export */


      __webpack_require__.d(__webpack_exports__, {
        /* harmony export */
        "header": function header() {
          return (
            /* binding */
            _header
          );
        },

        /* harmony export */
        "handleError": function handleError() {
          return (
            /* binding */
            _handleError
          );
        }
        /* harmony export */

      });
      /* harmony import */


      var _angular_common_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! @angular/common/http */
      91841);
      /* harmony import */


      var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! rxjs */
      40205);

      var _header = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__.HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      });

      var _handleError = function _handleError(error) {
        if (error.error instanceof ErrorEvent) {
          throw error.error.message;
        } else {
          console.error("Backend returned code ".concat(error.status, ", ") + "body was: ".concat(error.error));
        }

        return (0, rxjs__WEBPACK_IMPORTED_MODULE_1__.throwError)(error);
      };
      /***/

    }
  }]);
})();
//# sourceMappingURL=common-es5.js.map