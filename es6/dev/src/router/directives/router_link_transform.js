var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ElementAst, BoundDirectivePropertyAst, DirectiveAst } from 'angular2/compiler';
import { AstTransformer, LiteralArray, LiteralPrimitive } from 'angular2/src/compiler/expression_parser/ast';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Injectable } from 'angular2/core';
import { Parser } from 'angular2/src/compiler/expression_parser/parser';
/**
 * e.g., './User', 'Modal' in ./User[Modal(param: value)]
 */
class FixedPart {
    constructor(value) {
        this.value = value;
    }
}
/**
 * The square bracket
 */
class AuxiliaryStart {
    constructor() {
    }
}
/**
 * The square bracket
 */
class AuxiliaryEnd {
    constructor() {
    }
}
/**
 * e.g., param:value in ./User[Modal(param: value)]
 */
class Params {
    constructor(ast) {
        this.ast = ast;
    }
}
class RouterLinkLexer {
    constructor(parser, exp) {
        this.parser = parser;
        this.exp = exp;
        this.index = 0;
    }
    tokenize() {
        let tokens = [];
        while (this.index < this.exp.length) {
            tokens.push(this._parseToken());
        }
        return tokens;
    }
    _parseToken() {
        let c = this.exp[this.index];
        if (c == '[') {
            this.index++;
            return new AuxiliaryStart();
        }
        else if (c == ']') {
            this.index++;
            return new AuxiliaryEnd();
        }
        else if (c == '(') {
            return this._parseParams();
        }
        else if (c == '/' && this.index !== 0) {
            this.index++;
            return this._parseFixedPart();
        }
        else {
            return this._parseFixedPart();
        }
    }
    _parseParams() {
        let start = this.index;
        for (; this.index < this.exp.length; ++this.index) {
            let c = this.exp[this.index];
            if (c == ')') {
                let paramsContent = this.exp.substring(start + 1, this.index);
                this.index++;
                return new Params(this.parser.parseBinding(`{${paramsContent}}`, null).ast);
            }
        }
        throw new BaseException("Cannot find ')'");
    }
    _parseFixedPart() {
        let start = this.index;
        let sawNonSlash = false;
        for (; this.index < this.exp.length; ++this.index) {
            let c = this.exp[this.index];
            if (c == '(' || c == '[' || c == ']' || (c == '/' && sawNonSlash)) {
                break;
            }
            if (c != '.' && c != '/') {
                sawNonSlash = true;
            }
        }
        let fixed = this.exp.substring(start, this.index);
        if (start === this.index || !sawNonSlash || fixed.startsWith('//')) {
            throw new BaseException("Invalid router link");
        }
        return new FixedPart(fixed);
    }
}
class RouterLinkAstGenerator {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
    }
    generate() { return this._genAuxiliary(); }
    _genAuxiliary() {
        let arr = [];
        for (; this.index < this.tokens.length; this.index++) {
            let r = this.tokens[this.index];
            if (r instanceof FixedPart) {
                arr.push(new LiteralPrimitive(r.value));
            }
            else if (r instanceof Params) {
                arr.push(r.ast);
            }
            else if (r instanceof AuxiliaryEnd) {
                break;
            }
            else if (r instanceof AuxiliaryStart) {
                this.index++;
                arr.push(this._genAuxiliary());
            }
        }
        return new LiteralArray(arr);
    }
}
class RouterLinkAstTransformer extends AstTransformer {
    constructor(parser) {
        super();
        this.parser = parser;
    }
    visitQuote(ast, context) {
        if (ast.prefix == "route") {
            return parseRouterLinkExpression(this.parser, ast.uninterpretedExpression);
        }
        else {
            return super.visitQuote(ast, context);
        }
    }
}
export function parseRouterLinkExpression(parser, exp) {
    let tokens = new RouterLinkLexer(parser, exp.trim()).tokenize();
    return new RouterLinkAstGenerator(tokens).generate();
}
/**
 * A compiler plugin that implements the router link DSL.
 */
export let RouterLinkTransform = class RouterLinkTransform {
    constructor(parser) {
        this.astTransformer = new RouterLinkAstTransformer(parser);
    }
    visitNgContent(ast, context) { return ast; }
    visitEmbeddedTemplate(ast, context) { return ast; }
    visitElement(ast, context) {
        let updatedChildren = ast.children.map(c => c.visit(this, context));
        let updatedInputs = ast.inputs.map(c => c.visit(this, context));
        let updatedDirectives = ast.directives.map(c => c.visit(this, context));
        return new ElementAst(ast.name, ast.attrs, updatedInputs, ast.outputs, ast.exportAsVars, updatedDirectives, ast.providers, updatedChildren, ast.ngContentIndex, ast.sourceSpan);
    }
    visitVariable(ast, context) { return ast; }
    visitEvent(ast, context) { return ast; }
    visitElementProperty(ast, context) { return ast; }
    visitAttr(ast, context) { return ast; }
    visitBoundText(ast, context) { return ast; }
    visitText(ast, context) { return ast; }
    visitDirective(ast, context) {
        let updatedInputs = ast.inputs.map(c => c.visit(this, context));
        return new DirectiveAst(ast.directive, updatedInputs, ast.hostProperties, ast.hostEvents, ast.exportAsVars, ast.sourceSpan);
    }
    visitDirectiveProperty(ast, context) {
        let transformedValue = ast.value.visit(this.astTransformer);
        return new BoundDirectivePropertyAst(ast.directiveName, ast.templateName, transformedValue, ast.sourceSpan);
    }
};
RouterLinkTransform = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Parser])
], RouterLinkTransform);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmtfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1DRTZ4RkY1Wi50bXAvYW5ndWxhcjIvc3JjL3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rX3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUVMLFVBQVUsRUFDVix5QkFBeUIsRUFDekIsWUFBWSxFQUViLE1BQU0sbUJBQW1CO09BQ25CLEVBQ0wsY0FBYyxFQUlkLFlBQVksRUFDWixnQkFBZ0IsRUFFakIsTUFBTSw2Q0FBNkM7T0FDN0MsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BQ2pDLEVBQUMsTUFBTSxFQUFDLE1BQU0sZ0RBQWdEO0FBRXJFOztHQUVHO0FBQ0g7SUFDRSxZQUFtQixLQUFhO1FBQWIsVUFBSyxHQUFMLEtBQUssQ0FBUTtJQUFHLENBQUM7QUFDdEMsQ0FBQztBQUVEOztHQUVHO0FBQ0g7SUFDRTtJQUFlLENBQUM7QUFDbEIsQ0FBQztBQUVEOztHQUVHO0FBQ0g7SUFDRTtJQUFlLENBQUM7QUFDbEIsQ0FBQztBQUVEOztHQUVHO0FBQ0g7SUFDRSxZQUFtQixHQUFRO1FBQVIsUUFBRyxHQUFILEdBQUcsQ0FBSztJQUFHLENBQUM7QUFDakMsQ0FBQztBQUVEO0lBR0UsWUFBb0IsTUFBYyxFQUFVLEdBQVc7UUFBbkMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFVLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFGdkQsVUFBSyxHQUFXLENBQUMsQ0FBQztJQUV3QyxDQUFDO0lBRTNELFFBQVE7UUFDTixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDcEMsTUFBTSxD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QUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUNyRCxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdkQsQ0FBQztBQUNILENBQUM7QUExQ0Q7SUFBQyxVQUFVLEVBQUU7O3VCQUFBO0FBMENaIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgVGVtcGxhdGVBc3RWaXNpdG9yLFxuICBFbGVtZW50QXN0LFxuICBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LFxuICBEaXJlY3RpdmVBc3QsXG4gIEJvdW5kRWxlbWVudFByb3BlcnR5QXN0XG59IGZyb20gJ2FuZ3VsYXIyL2NvbXBpbGVyJztcbmltcG9ydCB7XG4gIEFzdFRyYW5zZm9ybWVyLFxuICBRdW90ZSxcbiAgQVNULFxuICBFbXB0eUV4cHIsXG4gIExpdGVyYWxBcnJheSxcbiAgTGl0ZXJhbFByaW1pdGl2ZSxcbiAgQVNUV2l0aFNvdXJjZVxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1BhcnNlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2V4cHJlc3Npb25fcGFyc2VyL3BhcnNlcic7XG5cbi8qKlxuICogZS5nLiwgJy4vVXNlcicsICdNb2RhbCcgaW4gLi9Vc2VyW01vZGFsKHBhcmFtOiB2YWx1ZSldXG4gKi9cbmNsYXNzIEZpeGVkUGFydCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIFRoZSBzcXVhcmUgYnJhY2tldFxuICovXG5jbGFzcyBBdXhpbGlhcnlTdGFydCB7XG4gIGNvbnN0cnVjdG9yKCkge31cbn1cblxuLyoqXG4gKiBUaGUgc3F1YXJlIGJyYWNrZXRcbiAqL1xuY2xhc3MgQXV4aWxpYXJ5RW5kIHtcbiAgY29uc3RydWN0b3IoKSB7fVxufVxuXG4vKipcbiAqIGUuZy4sIHBhcmFtOnZhbHVlIGluIC4vVXNlcltNb2RhbChwYXJhbTogdmFsdWUpXVxuICovXG5jbGFzcyBQYXJhbXMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYXN0OiBBU1QpIHt9XG59XG5cbmNsYXNzIFJvdXRlckxpbmtMZXhlciB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFyc2VyOiBQYXJzZXIsIHByaXZhdGUgZXhwOiBzdHJpbmcpIHt9XG5cbiAgdG9rZW5pemUoKTogQXJyYXk8Rml4ZWRQYXJ0IHwgQXV4aWxpYXJ5U3RhcnQgfCBBdXhpbGlhcnlFbmQgfCBQYXJhbXM+IHtcbiAgICBsZXQgdG9rZW5zID0gW107XG4gICAgd2hpbGUgKHRoaXMuaW5kZXggPCB0aGlzLmV4cC5sZW5ndGgpIHtcbiAgICAgIHRva2Vucy5wdXNoKHRoaXMuX3BhcnNlVG9rZW4oKSk7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVRva2VuKCkge1xuICAgIGxldCBjID0gdGhpcy5leHBbdGhpcy5pbmRleF07XG4gICAgaWYgKGMgPT0gJ1snKSB7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICByZXR1cm4gbmV3IEF1eGlsaWFyeVN0YXJ0KCk7XG5cbiAgICB9IGVsc2UgaWYgKGMgPT0gJ10nKSB7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgICByZXR1cm4gbmV3IEF1eGlsaWFyeUVuZCgpO1xuXG4gICAgfSBlbHNlIGlmIChjID09ICcoJykge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlUGFyYW1zKCk7XG5cbiAgICB9IGVsc2UgaWYgKGMgPT0gJy8nICYmIHRoaXMuaW5kZXggIT09IDApIHtcbiAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIHJldHVybiB0aGlzLl9wYXJzZUZpeGVkUGFydCgpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJzZUZpeGVkUGFydCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUGFyYW1zKCkge1xuICAgIGxldCBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgZm9yICg7IHRoaXMuaW5kZXggPCB0aGlzLmV4cC5sZW5ndGg7ICsrdGhpcy5pbmRleCkge1xuICAgICAgbGV0IGMgPSB0aGlzLmV4cFt0aGlzLmluZGV4XTtcbiAgICAgIGlmIChjID09ICcpJykge1xuICAgICAgICBsZXQgcGFyYW1zQ29udGVudCA9IHRoaXMuZXhwLnN1YnN0cmluZyhzdGFydCArIDEsIHRoaXMuaW5kZXgpO1xuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgIHJldHVybiBuZXcgUGFyYW1zKHRoaXMucGFyc2VyLnBhcnNlQmluZGluZyhgeyR7cGFyYW1zQ29udGVudH19YCwgbnVsbCkuYXN0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJDYW5ub3QgZmluZCAnKSdcIik7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUZpeGVkUGFydCgpIHtcbiAgICBsZXQgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIGxldCBzYXdOb25TbGFzaCA9IGZhbHNlO1xuXG5cbiAgICBmb3IgKDsgdGhpcy5pbmRleCA8IHRoaXMuZXhwLmxlbmd0aDsgKyt0aGlzLmluZGV4KSB7XG4gICAgICBsZXQgYyA9IHRoaXMuZXhwW3RoaXMuaW5kZXhdO1xuXG4gICAgICBpZiAoYyA9PSAnKCcgfHwgYyA9PSAnWycgfHwgYyA9PSAnXScgfHwgKGMgPT0gJy8nICYmIHNhd05vblNsYXNoKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKGMgIT0gJy4nICYmIGMgIT0gJy8nKSB7XG4gICAgICAgIHNhd05vblNsYXNoID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZml4ZWQgPSB0aGlzLmV4cC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuXG4gICAgaWYgKHN0YXJ0ID09PSB0aGlzLmluZGV4IHx8ICFzYXdOb25TbGFzaCB8fCBmaXhlZC5zdGFydHNXaXRoKCcvLycpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcIkludmFsaWQgcm91dGVyIGxpbmtcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBGaXhlZFBhcnQoZml4ZWQpO1xuICB9XG59XG5cbmNsYXNzIFJvdXRlckxpbmtBc3RHZW5lcmF0b3Ige1xuICBpbmRleDogbnVtYmVyID0gMDtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0b2tlbnM6IGFueVtdKSB7fVxuXG4gIGdlbmVyYXRlKCk6IEFTVCB7IHJldHVybiB0aGlzLl9nZW5BdXhpbGlhcnkoKTsgfVxuXG4gIHByaXZhdGUgX2dlbkF1eGlsaWFyeSgpOiBBU1Qge1xuICAgIGxldCBhcnIgPSBbXTtcbiAgICBmb3IgKDsgdGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aDsgdGhpcy5pbmRleCsrKSB7XG4gICAgICBsZXQgciA9IHRoaXMudG9rZW5zW3RoaXMuaW5kZXhdO1xuXG4gICAgICBpZiAociBpbnN0YW5jZW9mIEZpeGVkUGFydCkge1xuICAgICAgICBhcnIucHVzaChuZXcgTGl0ZXJhbFByaW1pdGl2ZShyLnZhbHVlKSk7XG5cbiAgICAgIH0gZWxzZSBpZiAociBpbnN0YW5jZW9mIFBhcmFtcykge1xuICAgICAgICBhcnIucHVzaChyLmFzdCk7XG5cbiAgICAgIH0gZWxzZSBpZiAociBpbnN0YW5jZW9mIEF1eGlsaWFyeUVuZCkge1xuICAgICAgICBicmVhaztcblxuICAgICAgfSBlbHNlIGlmIChyIGluc3RhbmNlb2YgQXV4aWxpYXJ5U3RhcnQpIHtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICBhcnIucHVzaCh0aGlzLl9nZW5BdXhpbGlhcnkoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBMaXRlcmFsQXJyYXkoYXJyKTtcbiAgfVxufVxuXG5jbGFzcyBSb3V0ZXJMaW5rQXN0VHJhbnNmb3JtZXIgZXh0ZW5kcyBBc3RUcmFuc2Zvcm1lciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFyc2VyOiBQYXJzZXIpIHsgc3VwZXIoKTsgfVxuXG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBpZiAoYXN0LnByZWZpeCA9PSBcInJvdXRlXCIpIHtcbiAgICAgIHJldHVybiBwYXJzZVJvdXRlckxpbmtFeHByZXNzaW9uKHRoaXMucGFyc2VyLCBhc3QudW5pbnRlcnByZXRlZEV4cHJlc3Npb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIudmlzaXRRdW90ZShhc3QsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VSb3V0ZXJMaW5rRXhwcmVzc2lvbihwYXJzZXI6IFBhcnNlciwgZXhwOiBzdHJpbmcpOiBBU1Qge1xuICBsZXQgdG9rZW5zID0gbmV3IFJvdXRlckxpbmtMZXhlcihwYXJzZXIsIGV4cC50cmltKCkpLnRva2VuaXplKCk7XG4gIHJldHVybiBuZXcgUm91dGVyTGlua0FzdEdlbmVyYXRvcih0b2tlbnMpLmdlbmVyYXRlKCk7XG59XG5cbi8qKlxuICogQSBjb21waWxlciBwbHVnaW4gdGhhdCBpbXBsZW1lbnRzIHRoZSByb3V0ZXIgbGluayBEU0wuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb3V0ZXJMaW5rVHJhbnNmb3JtIGltcGxlbWVudHMgVGVtcGxhdGVBc3RWaXNpdG9yIHtcbiAgcHJpdmF0ZSBhc3RUcmFuc2Zvcm1lcjtcblxuICBjb25zdHJ1Y3RvcihwYXJzZXI6IFBhcnNlcikgeyB0aGlzLmFzdFRyYW5zZm9ybWVyID0gbmV3IFJvdXRlckxpbmtBc3RUcmFuc2Zvcm1lcihwYXJzZXIpOyB9XG5cbiAgdmlzaXROZ0NvbnRlbnQoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEVsZW1lbnQoYXN0OiBFbGVtZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGxldCB1cGRhdGVkQ2hpbGRyZW4gPSBhc3QuY2hpbGRyZW4ubWFwKGMgPT4gYy52aXNpdCh0aGlzLCBjb250ZXh0KSk7XG4gICAgbGV0IHVwZGF0ZWRJbnB1dHMgPSBhc3QuaW5wdXRzLm1hcChjID0+IGMudmlzaXQodGhpcywgY29udGV4dCkpO1xuICAgIGxldCB1cGRhdGVkRGlyZWN0aXZlcyA9IGFzdC5kaXJlY3RpdmVzLm1hcChjID0+IGMudmlzaXQodGhpcywgY29udGV4dCkpO1xuICAgIHJldHVybiBuZXcgRWxlbWVudEFzdChhc3QubmFtZSwgYXN0LmF0dHJzLCB1cGRhdGVkSW5wdXRzLCBhc3Qub3V0cHV0cywgYXN0LmV4cG9ydEFzVmFycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZERpcmVjdGl2ZXMsIGFzdC5wcm92aWRlcnMsIHVwZGF0ZWRDaGlsZHJlbiwgYXN0Lm5nQ29udGVudEluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Quc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdFZhcmlhYmxlKGFzdDogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRFdmVudChhc3Q6IGFueSwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuXG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRBdHRyKGFzdDogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG5cbiAgdmlzaXRCb3VuZFRleHQoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdFRleHQoYXN0OiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdERpcmVjdGl2ZShhc3Q6IERpcmVjdGl2ZUFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBsZXQgdXBkYXRlZElucHV0cyA9IGFzdC5pbnB1dHMubWFwKGMgPT4gYy52aXNpdCh0aGlzLCBjb250ZXh0KSk7XG4gICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVBc3QoYXN0LmRpcmVjdGl2ZSwgdXBkYXRlZElucHV0cywgYXN0Lmhvc3RQcm9wZXJ0aWVzLCBhc3QuaG9zdEV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QuZXhwb3J0QXNWYXJzLCBhc3Quc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdERpcmVjdGl2ZVByb3BlcnR5KGFzdDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBsZXQgdHJhbnNmb3JtZWRWYWx1ZSA9IGFzdC52YWx1ZS52aXNpdCh0aGlzLmFzdFRyYW5zZm9ybWVyKTtcbiAgICByZXR1cm4gbmV3IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QoYXN0LmRpcmVjdGl2ZU5hbWUsIGFzdC50ZW1wbGF0ZU5hbWUsIHRyYW5zZm9ybWVkVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxufSJdfQ==