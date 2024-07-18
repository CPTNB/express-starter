var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getObjectUtils } from "../object";
import { getObjectLikeUtils } from "../object-like";
import { getSchemaUtils } from "../schema-utils";
import { constructLazyBaseSchema, getMemoizedSchema } from "./lazy";
export function lazyObject(getter) {
    const baseSchema = Object.assign(Object.assign({}, constructLazyBaseSchema(getter)), { _getRawProperties: () => __awaiter(this, void 0, void 0, function* () { return (yield getMemoizedSchema(getter))._getRawProperties(); }), _getParsedProperties: () => __awaiter(this, void 0, void 0, function* () { return (yield getMemoizedSchema(getter))._getParsedProperties(); }) });
    return Object.assign(Object.assign(Object.assign(Object.assign({}, baseSchema), getSchemaUtils(baseSchema)), getObjectLikeUtils(baseSchema)), getObjectUtils(baseSchema));
}
