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
import { maybeSkipValidation } from "../../utils/maybeSkipValidation";
import { getSchemaUtils } from "../schema-utils";
export function undiscriminatedUnion(schemas) {
    const baseSchema = {
        parse: (raw, opts) => __awaiter(this, void 0, void 0, function* () {
            return validateAndTransformUndiscriminatedUnion((schema, opts) => schema.parse(raw, opts), schemas, opts);
        }),
        json: (parsed, opts) => __awaiter(this, void 0, void 0, function* () {
            return validateAndTransformUndiscriminatedUnion((schema, opts) => schema.json(parsed, opts), schemas, opts);
        }),
        getType: () => SchemaType.UNDISCRIMINATED_UNION,
    };
    return Object.assign(Object.assign({}, maybeSkipValidation(baseSchema)), getSchemaUtils(baseSchema));
}
function validateAndTransformUndiscriminatedUnion(transform, schemas, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = [];
        for (const [index, schema] of schemas.entries()) {
            const transformed = yield transform(schema, Object.assign(Object.assign({}, opts), { skipValidation: false }));
            if (transformed.ok) {
                return transformed;
            }
            else {
                for (const error of transformed.errors) {
                    errors.push({
                        path: error.path,
                        message: `[Variant ${index}] ${error.message}`,
                    });
                }
            }
        }
        return {
            ok: false,
            errors,
        };
    });
}
