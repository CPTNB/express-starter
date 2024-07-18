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
import { filterObject } from "../../utils/filterObject";
import { getErrorMessageForIncorrectType } from "../../utils/getErrorMessageForIncorrectType";
import { isPlainObject } from "../../utils/isPlainObject";
import { keys } from "../../utils/keys";
import { maybeSkipValidation } from "../../utils/maybeSkipValidation";
import { partition } from "../../utils/partition";
import { getObjectLikeUtils } from "../object-like";
import { getSchemaUtils } from "../schema-utils";
import { isProperty } from "./property";
export function object(schemas) {
    const baseSchema = {
        _getRawProperties: () => Promise.resolve(Object.entries(schemas).map(([parsedKey, propertySchema]) => isProperty(propertySchema) ? propertySchema.rawKey : parsedKey)),
        _getParsedProperties: () => Promise.resolve(keys(schemas)),
        parse: (raw, opts) => __awaiter(this, void 0, void 0, function* () {
            const rawKeyToProperty = {};
            const requiredKeys = [];
            for (const [parsedKey, schemaOrObjectProperty] of entries(schemas)) {
                const rawKey = isProperty(schemaOrObjectProperty) ? schemaOrObjectProperty.rawKey : parsedKey;
                const valueSchema = isProperty(schemaOrObjectProperty)
                    ? schemaOrObjectProperty.valueSchema
                    : schemaOrObjectProperty;
                const property = {
                    rawKey,
                    parsedKey: parsedKey,
                    valueSchema,
                };
                rawKeyToProperty[rawKey] = property;
                if (isSchemaRequired(valueSchema)) {
                    requiredKeys.push(rawKey);
                }
            }
            return validateAndTransformObject({
                value: raw,
                requiredKeys,
                getProperty: (rawKey) => {
                    const property = rawKeyToProperty[rawKey];
                    if (property == null) {
                        return undefined;
                    }
                    return {
                        transformedKey: property.parsedKey,
                        transform: (propertyValue) => {
                            var _a;
                            return property.valueSchema.parse(propertyValue, Object.assign(Object.assign({}, opts), { breadcrumbsPrefix: [...((_a = opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix) !== null && _a !== void 0 ? _a : []), rawKey] }));
                        },
                    };
                },
                unrecognizedObjectKeys: opts === null || opts === void 0 ? void 0 : opts.unrecognizedObjectKeys,
                skipValidation: opts === null || opts === void 0 ? void 0 : opts.skipValidation,
                breadcrumbsPrefix: opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix,
            });
        }),
        json: (parsed, opts) => __awaiter(this, void 0, void 0, function* () {
            const requiredKeys = [];
            for (const [parsedKey, schemaOrObjectProperty] of entries(schemas)) {
                const valueSchema = isProperty(schemaOrObjectProperty)
                    ? schemaOrObjectProperty.valueSchema
                    : schemaOrObjectProperty;
                if (isSchemaRequired(valueSchema)) {
                    requiredKeys.push(parsedKey);
                }
            }
            return validateAndTransformObject({
                value: parsed,
                requiredKeys,
                getProperty: (parsedKey) => {
                    const property = schemas[parsedKey];
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (property == null) {
                        return undefined;
                    }
                    if (isProperty(property)) {
                        return {
                            transformedKey: property.rawKey,
                            transform: (propertyValue) => {
                                var _a;
                                return property.valueSchema.json(propertyValue, Object.assign(Object.assign({}, opts), { breadcrumbsPrefix: [...((_a = opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix) !== null && _a !== void 0 ? _a : []), parsedKey] }));
                            },
                        };
                    }
                    else {
                        return {
                            transformedKey: parsedKey,
                            transform: (propertyValue) => {
                                var _a;
                                return property.json(propertyValue, Object.assign(Object.assign({}, opts), { breadcrumbsPrefix: [...((_a = opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix) !== null && _a !== void 0 ? _a : []), parsedKey] }));
                            },
                        };
                    }
                },
                unrecognizedObjectKeys: opts === null || opts === void 0 ? void 0 : opts.unrecognizedObjectKeys,
                skipValidation: opts === null || opts === void 0 ? void 0 : opts.skipValidation,
                breadcrumbsPrefix: opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix,
            });
        }),
        getType: () => SchemaType.OBJECT,
    };
    return Object.assign(Object.assign(Object.assign(Object.assign({}, maybeSkipValidation(baseSchema)), getSchemaUtils(baseSchema)), getObjectLikeUtils(baseSchema)), getObjectUtils(baseSchema));
}
function validateAndTransformObject({ value, requiredKeys, getProperty, unrecognizedObjectKeys = "fail", skipValidation = false, breadcrumbsPrefix = [], }) {
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
        const missingRequiredKeys = new Set(requiredKeys);
        const errors = [];
        const transformed = {};
        for (const [preTransformedKey, preTransformedItemValue] of Object.entries(value)) {
            const property = getProperty(preTransformedKey);
            if (property != null) {
                missingRequiredKeys.delete(preTransformedKey);
                const value = yield property.transform(preTransformedItemValue);
                if (value.ok) {
                    transformed[property.transformedKey] = value.value;
                }
                else {
                    transformed[preTransformedKey] = preTransformedItemValue;
                    errors.push(...value.errors);
                }
            }
            else {
                switch (unrecognizedObjectKeys) {
                    case "fail":
                        errors.push({
                            path: [...breadcrumbsPrefix, preTransformedKey],
                            message: `Unexpected key "${preTransformedKey}"`,
                        });
                        break;
                    case "strip":
                        break;
                    case "passthrough":
                        transformed[preTransformedKey] = preTransformedItemValue;
                        break;
                }
            }
        }
        errors.push(...requiredKeys
            .filter((key) => missingRequiredKeys.has(key))
            .map((key) => ({
            path: breadcrumbsPrefix,
            message: `Missing required key "${key}"`,
        })));
        if (errors.length === 0 || skipValidation) {
            return {
                ok: true,
                value: transformed,
            };
        }
        else {
            return {
                ok: false,
                errors,
            };
        }
    });
}
export function getObjectUtils(schema) {
    return {
        extend: (extension) => {
            const baseSchema = {
                _getParsedProperties: () => __awaiter(this, void 0, void 0, function* () {
                    return [
                        ...(yield schema._getParsedProperties()),
                        ...(yield extension._getParsedProperties()),
                    ];
                }),
                _getRawProperties: () => __awaiter(this, void 0, void 0, function* () {
                    return [
                        ...(yield schema._getRawProperties()),
                        ...(yield extension._getRawProperties()),
                    ];
                }),
                parse: (raw, opts) => __awaiter(this, void 0, void 0, function* () {
                    return validateAndTransformExtendedObject({
                        extensionKeys: yield extension._getRawProperties(),
                        value: raw,
                        transformBase: (rawBase) => schema.parse(rawBase, opts),
                        transformExtension: (rawExtension) => extension.parse(rawExtension, opts),
                    });
                }),
                json: (parsed, opts) => __awaiter(this, void 0, void 0, function* () {
                    return validateAndTransformExtendedObject({
                        extensionKeys: yield extension._getParsedProperties(),
                        value: parsed,
                        transformBase: (parsedBase) => schema.json(parsedBase, opts),
                        transformExtension: (parsedExtension) => extension.json(parsedExtension, opts),
                    });
                }),
                getType: () => SchemaType.OBJECT,
            };
            return Object.assign(Object.assign(Object.assign(Object.assign({}, baseSchema), getSchemaUtils(baseSchema)), getObjectLikeUtils(baseSchema)), getObjectUtils(baseSchema));
        },
    };
}
function validateAndTransformExtendedObject({ extensionKeys, value, transformBase, transformExtension, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionPropertiesSet = new Set(extensionKeys);
        const [extensionProperties, baseProperties] = partition(keys(value), (key) => extensionPropertiesSet.has(key));
        const transformedBase = yield transformBase(filterObject(value, baseProperties));
        const transformedExtension = yield transformExtension(filterObject(value, extensionProperties));
        if (transformedBase.ok && transformedExtension.ok) {
            return {
                ok: true,
                value: Object.assign(Object.assign({}, transformedBase.value), transformedExtension.value),
            };
        }
        else {
            return {
                ok: false,
                errors: [
                    ...(transformedBase.ok ? [] : transformedBase.errors),
                    ...(transformedExtension.ok ? [] : transformedExtension.errors),
                ],
            };
        }
    });
}
function isSchemaRequired(schema) {
    return !isSchemaOptional(schema);
}
function isSchemaOptional(schema) {
    switch (schema.getType()) {
        case SchemaType.ANY:
        case SchemaType.UNKNOWN:
        case SchemaType.OPTIONAL:
            return true;
        default:
            return false;
    }
}
