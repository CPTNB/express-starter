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
import { getErrorMessageForIncorrectType } from "../../utils/getErrorMessageForIncorrectType";
import { maybeSkipValidation } from "../../utils/maybeSkipValidation";
import { getSchemaUtils } from "../schema-utils";
export function list(schema) {
    const baseSchema = {
        parse: (raw, opts) => __awaiter(this, void 0, void 0, function* () {
            return validateAndTransformArray(raw, (item, index) => {
                var _a;
                return schema.parse(item, Object.assign(Object.assign({}, opts), { breadcrumbsPrefix: [...((_a = opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix) !== null && _a !== void 0 ? _a : []), `[${index}]`] }));
            });
        }),
        json: (parsed, opts) => validateAndTransformArray(parsed, (item, index) => {
            var _a;
            return schema.json(item, Object.assign(Object.assign({}, opts), { breadcrumbsPrefix: [...((_a = opts === null || opts === void 0 ? void 0 : opts.breadcrumbsPrefix) !== null && _a !== void 0 ? _a : []), `[${index}]`] }));
        }),
        getType: () => SchemaType.LIST,
    };
    return Object.assign(Object.assign({}, maybeSkipValidation(baseSchema)), getSchemaUtils(baseSchema));
}
function validateAndTransformArray(value, transformItem) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Array.isArray(value)) {
            return {
                ok: false,
                errors: [
                    {
                        message: getErrorMessageForIncorrectType(value, "list"),
                        path: [],
                    },
                ],
            };
        }
        const maybeValidItems = yield Promise.all(value.map((item, index) => transformItem(item, index)));
        return maybeValidItems.reduce((acc, item) => {
            if (acc.ok && item.ok) {
                return {
                    ok: true,
                    value: [...acc.value, item.value],
                };
            }
            const errors = [];
            if (!acc.ok) {
                errors.push(...acc.errors);
            }
            if (!item.ok) {
                errors.push(...item.errors);
            }
            return {
                ok: false,
                errors,
            };
        }, { ok: true, value: [] });
    });
}
