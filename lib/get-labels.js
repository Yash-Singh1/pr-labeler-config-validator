"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const defaultHeaders = { 'User-Agent': 'node.js' };
function getLabels(httpClient, process) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let page = 1;
        let results = [];
        while (results.length === 0 ||
            (results[results.length - 1] && results[results.length - 1].length !== 0)) {
            results.push((_a = (yield httpClient.getJson(`${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}/labels?page=${page}`, process.env.GITHUB_TOKEN
                ? Object.assign({ Authorization: process.env.GITHUB_TOKEN }, defaultHeaders) : defaultHeaders))) === null || _a === void 0 ? void 0 : _a.result);
            page++;
        }
        results = results.reduce((acc, labelsPage) => {
            if (!labelsPage)
                return acc;
            acc.push(...labelsPage);
            return acc;
        }, []);
        if (!results) {
            return null;
        }
        else {
            return results;
        }
    });
}
exports.default = getLabels;
