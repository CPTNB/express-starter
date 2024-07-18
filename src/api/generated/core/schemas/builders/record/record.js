var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SchemaType } from "../../Schema";
import { entries } from "../../utils/entries";
import { getErrorMessageForIncorrectType } from "../../utils/getErrorMessageForIncorrectType";
import { isPlainObject } from "../../utils/isPlainObject";
import { maybeSkipValidation } from "../../utils/maybeSkipValidation";
import { getSchemaUtils } from "../schema-utils";
export function record(keySchema, valueSchema) {
    const baseSchema = {
        parse: (raw, opts) => __awaiter(this, void 0, void 0, function* () {
            return validateAndTransformRecord({
                value: raw,
                isKeyNumeric: (yield keySchema.getType()) === SchemaType.NUMBER,
                transformKey: (key) => {
                    var _a;
                    return keySchema.parse(key, Object.assign(Object.assign({}, opts), { breadcrumbsPrefix: [...((_a = opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix) !== null && _a !== void 0 ? _a : []), `${key} (key)`] }));
                },
                transformValue: (value, key) => {
                    var _a;
                    return valueSchema.parse(value, Object.assign(Object.assign({}, opts), { breadcrumbsPrefix: [...((_a = opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix) !== null && _a !== void 0 ? _a : []), `${key}`] }));
                },
                breadcrumbsPrefix: opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix,
            });
        }),
        json: (parsed, opts) => __awaiter(this, void 0, void 0, function* () {
            return validateAndTransformRecord({
                value: parsed,
                isKeyNumeric: (yield keySchema.getType()) === SchemaType.NUMBER,
                transformKey: (key) => {
                    var _a;
                    return keySchema.json(key, Object.assign(Object.assign({}, opts), { breadcrumbsPrefix: [...((_a = opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix) !== null && _a !== void 0 ? _a : []), `${key} (key)`] }));
                },
                transformValue: (value, key) => {
                    var _a;
                    return valueSchema.json(value, Object.assign(Object.assign({}, opts), { breadcrumbsPrefix: [...((_a = opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix) !== null && _a !== void 0 ? _a : []), `${key}`] }));
                },
                breadcrumbsPrefix: opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix,
            });
        }),
        getType: () => SchemaType.RECORD,
    };
    return Object.assign(Object.assign({}, maybeSkipValidation(baseSchema)), getSchemaUtils(baseSchema));
}
function validateAndTransformRecord({ value, isKeyNumeric, transformKey, transformValue, breadcrumbsPrefix = [], }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isPlainObject(value)) {
            return {
                ok: false,
                errors: [
                    {
                        path: breadcrumbsPrefix,
                        message: getErrorMessageForIncorrectType(value, "object"),
                    },
                ],
            };
        }
        return entries(value).reduce((accPromise, [stringKey, value]) => __awaiter(this, void 0, void 0, function* () {
            // skip nullish keys
            if (value == null) {
                return accPromise;
            }
            const acc = yield accPromise;
            let key = stringKey;
            if (isKeyNumeric) {
                const numberKey = stringKey.length > 0 ? Number(stringKey) : NaN;
                if (!isNaN(numberKey)) {
                    key = numberKey;
                }
            }
            const transformedKey = yield transformKey(key);
            const transformedValue = yield transformValue(value, key);
            if (acc.ok && transformedKey.ok && transformedValue.ok) {
                return {
                    ok: true,
                    value: Object.assign(Object.assign({}, acc.value), { [transformedKey.value]: transformedValue.value }),
                };
            }
            const errors = [];
            if (!acc.ok) {
                errors.push(...acc.errors);
            }
            if (!transformedKey.ok) {
                errors.push(...transformedKey.errors);
            }
            if (!transformedValue.ok) {
                errors.push(...transformedValue.errors);
            }
            return {
                ok: false,
                errors,
            };
        }), Promise.resolve({ ok: true, value: {} }));
    });
}
