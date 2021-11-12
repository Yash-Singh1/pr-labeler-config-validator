import * as Core from '@actions/core';
import { HttpClient } from '@actions/http-client';
import process from 'process';
import { readFileSync } from 'fs';
import validate from './validate';

export type ReadFileSync = typeof readFileSync;
export type Process = typeof process;
export type Validate = typeof validate;

export type Core = typeof Core;

type ActionArgs = [HttpClient, Core, ReadFileSync, Process, Validate];

export default ActionArgs;
