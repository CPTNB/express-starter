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
import { JsonError } from "./JsonError";
import { ParseError } from "./ParseError";
export function getSchemaUtils(schema) {
    return {
        optional: () => optional(schema),
        transform: (transformer) => transform(schema, transformer),
        parseOrThrow: (raw, opts) => __awaiter(this, void 0, void 0, function* () {
            const parsed = yield schema.parse(raw, opts);
            if (parsed.ok) {
                return parsed.value;
            }
            throw new ParseError(parsed.errors);
        }),
        jsonOrThrow: (parsed, opts) => __awaiter(this, void 0, void 0, function* () {
            const raw = yield schema.json(parsed, opts);
            if (raw.ok) {
                return raw.value;
            }
            throw new JsonError(raw.errors);
        }),
    };
}
/**
 * schema utils are defined in one file to resolve issues with circular imports
 */
export function optional(schema) {
    const baseSchema = {
        parse: (raw, opts) => {
            if (raw == null) {
                return {
                    ok: true,
                    value: undefined,
                };
            }
            return schema.parse(raw, opts);
        },
        json: (parsed, opts) => {
            if (parsed == null) {
                return {
                    ok: true,
                    value: null,
                };
            }
            return schema.json(parsed, opts);
        },
        getType: () => SchemaType.OPTIONAL,
    };
    return Object.assign(Object.assign({}, baseSchema), getSchemaUtils(baseSchema));
}
export function transform(schema, transformer) {
    const baseSchema = {
        parse: (raw, opts) => __awaiter(this, void 0, void 0, function* () {
            const parsed = yield schema.parse(raw, opts);
            if (!parsed.ok) {
                return parsed;
            }
            return {
                ok: true,
                value: transformer.transform(parsed.value),
            };
        }),
        json: (transformed, opts) => __awaiter(this, void 0, void 0, function* () {
            const parsed = yield transformer.untransform(transformed);
            return schema.json(parsed, opts);
        }),
        getType: () => schema.getType(),
    };
    return Object.assign(Object.assign({}, baseSchema), getSchemaUtils(baseSchema));
}
