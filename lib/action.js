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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
function action(...[httpClient, core, readFileSync, process, validate]) {
    return __awaiter(this, void 0, void 0, function* () {
        process.stdout.write('Fetching repository labels...');
        const defaultHeaders = { 'User-Agent': 'node.js' };
        const labels = yield httpClient
            .getJson(`${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}/labels`, process.env.GITHUB_TOKEN
            ? Object.assign({ Authorization: process.env.GITHUB_TOKEN }, defaultHeaders) : defaultHeaders)
            .catch((err) => {
            throw err;
        });
        console.log('done');
        process.stdout.write('Reading configuration file...');
        const configFile = core.getInput('configuration-path', { required: true });
        if (typeof configFile !== 'string') {
            throw new Error('Passed configuration file must be a string...');
        }
        const config = js_yaml_1.default.load(readFileSync(configFile.startsWith('/')
            ? configFile
            : path_1.default.join(process.env.GITHUB_WORKSPACE
                ? `/${process.env.GITHUB_WORKSPACE}`
                : '.', configFile), 'utf-8'));
        console.log('done');
        process.stdout.write('Validating config...');
        if (!validate(config, labels.result)) {
            process.exit(1);
        }
        else {
            console.log('done');
        }
    });
}
exports.default = action;
