import * as core from '@actions/core';
import { HttpClient } from '@actions/http-client';
import action from './action';
import process from 'process';
import { readFileSync } from 'fs';
import validate from './validate';

action(new HttpClient(), core, readFileSync, process, validate);
