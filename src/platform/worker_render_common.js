'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var core_1 = require('angular2/core');
var common_dom_1 = require('angular2/platform/common_dom');
var di_1 = require('angular2/src/core/di');
// TODO change these imports once dom_adapter is moved out of core
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var dom_events_1 = require('angular2/src/platform/dom/events/dom_events');
var key_events_1 = require('angular2/src/platform/dom/events/key_events');
var hammer_gestures_1 = require('angular2/src/platform/dom/events/hammer_gestures');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var dom_renderer_1 = require('angular2/src/platform/dom/dom_renderer');
var shared_styles_host_1 = require('angular2/src/platform/dom/shared_styles_host');
var shared_styles_host_2 = require("angular2/src/platform/dom/shared_styles_host");
var browser_details_1 = require('angular2/src/animate/browser_details');
var animation_builder_1 = require('angular2/src/animate/animation_builder');
var compiler_1 = require('angular2/compiler');
var xhr_impl_1 = require('angular2/src/platform/browser/xhr_impl');
var testability_1 = require('angular2/src/core/testability/testability');
var testability_2 = require('angular2/src/platform/browser/testability');
var browser_adapter_1 = require('./browser/browser_adapter');
var wtf_init_1 = require('angular2/src/core/profile/wtf_init');
var renderer_1 = require('angular2/src/web_workers/ui/renderer');
var xhr_impl_2 = require('angular2/src/web_workers/ui/xhr_impl');
var browser_platform_location_1 = require('angular2/src/router/location/browser_platform_location');
var service_message_broker_1 = require('angular2/src/web_workers/shared/service_message_broker');
var client_message_broker_1 = require('angular2/src/web_workers/shared/client_message_broker');
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var api_1 = require('angular2/src/web_workers/shared/api');
var render_store_1 = require('angular2/src/web_workers/shared/render_store');
var hammer_gestures_2 = require('./dom/events/hammer_gestures');
exports.WORKER_SCRIPT = lang_1.CONST_EXPR(new di_1.OpaqueToken("WebWorkerScript"));
// Message based Worker classes that listen on the MessageBus
exports.WORKER_RENDER_MESSAGING_PROVIDERS = lang_1.CONST_EXPR([renderer_1.MessageBasedRenderer, xhr_impl_2.MessageBasedXHRImpl]);
exports.WORKER_RENDER_PLATFORM = lang_1.CONST_EXPR([
    core_1.PLATFORM_COMMON_PROVIDERS,
    new di_1.Provider(core_1.PLATFORM_INITIALIZER, { useValue: initWebWorkerRenderPlatform, multi: true })
]);
/**
 * A list of {@link Provider}s. To use the router in a Worker enabled application you must
 * include these providers when setting up the render thread.
 */
exports.WORKER_RENDER_ROUTER = lang_1.CONST_EXPR([browser_platform_location_1.BrowserPlatformLocation]);
exports.WORKER_RENDER_APPLICATION_COMMON = lang_1.CONST_EXPR([
    core_1.APPLICATION_COMMON_PROVIDERS,
    exports.WORKER_RENDER_MESSAGING_PROVIDERS,
    new di_1.Provider(core_1.ExceptionHandler, { useFactory: _exceptionHandler, deps: [] }),
    new di_1.Provider(dom_tokens_1.DOCUMENT, { useFactory: _document, deps: [] }),
    // TODO(jteplitz602): Investigate if we definitely need EVENT_MANAGER on the render thread
    // #5298
    new di_1.Provider(common_dom_1.EVENT_MANAGER_PLUGINS, { useClass: dom_events_1.DomEventsPlugin, multi: true }),
    new di_1.Provider(common_dom_1.EVENT_MANAGER_PLUGINS, { useClass: key_events_1.KeyEventsPlugin, multi: true }),
    new di_1.Provider(common_dom_1.EVENT_MANAGER_PLUGINS, { useClass: hammer_gestures_1.HammerGesturesPlugin, multi: true }),
    new di_1.Provider(hammer_gestures_2.HAMMER_GESTURE_CONFIG, { useClass: hammer_gestures_2.HammerGestureConfig }),
    new di_1.Provider(dom_renderer_1.DomRootRenderer, { useClass: dom_renderer_1.DomRootRenderer_ }),
    new di_1.Provider(core_1.RootRenderer, { useExisting: dom_renderer_1.DomRootRenderer }),
    new di_1.Provider(shared_styles_host_2.SharedStylesHost, { useExisting: shared_styles_host_1.DomSharedStylesHost }),
    new di_1.Provider(compiler_1.XHR, { useClass: xhr_impl_1.XHRImpl }),
    xhr_impl_2.MessageBasedXHRImpl,
    new di_1.Provider(service_message_broker_1.ServiceMessageBrokerFactory, { useClass: service_message_broker_1.ServiceMessageBrokerFactory_ }),
    new di_1.Provider(client_message_broker_1.ClientMessageBrokerFactory, { useClass: client_message_broker_1.ClientMessageBrokerFactory_ }),
    serializer_1.Serializer,
    new di_1.Provider(api_1.ON_WEB_WORKER, { useValue: false }),
    render_store_1.RenderStore,
    shared_styles_host_1.DomSharedStylesHost,
    testability_1.Testability,
    browser_details_1.BrowserDetails,
    animation_builder_1.AnimationBuilder,
    common_dom_1.EventManager
]);
function initializeGenericWorkerRenderer(injector) {
    var bus = injector.get(message_bus_1.MessageBus);
    var zone = injector.get(ng_zone_1.NgZone);
    bus.attachToZone(zone);
    zone.run(function () {
        exports.WORKER_RENDER_MESSAGING_PROVIDERS.forEach(function (token) { injector.get(token).start(); });
    });
}
exports.initializeGenericWorkerRenderer = initializeGenericWorkerRenderer;
function initWebWorkerRenderPlatform() {
    browser_adapter_1.BrowserDomAdapter.makeCurrent();
    wtf_init_1.wtfInit();
    testability_2.BrowserGetTestability.init();
}
exports.initWebWorkerRenderPlatform = initWebWorkerRenderPlatform;
function _exceptionHandler() {
    return new core_1.ExceptionHandler(dom_adapter_1.DOM, !lang_1.IS_DART);
}
function _document() {
    return dom_adapter_1.DOM.defaultDoc();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlcl9jb21tb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVdlMVA0ZVQ1LnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vd29ya2VyX3JlbmRlcl9jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFCQUFrQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzdELDRCQUF5Qiw2Q0FBNkMsQ0FBQyxDQUFBO0FBQ3ZFLHdCQUFxQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ3RELHFCQWFPLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZCLDJCQUFrRCw4QkFBOEIsQ0FBQyxDQUFBO0FBQ2pGLG1CQUF1RCxzQkFBc0IsQ0FBQyxDQUFBO0FBQzlFLGtFQUFrRTtBQUNsRSw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUMxRCwyQkFBOEIsNkNBQTZDLENBQUMsQ0FBQTtBQUM1RSwyQkFBOEIsNkNBQTZDLENBQUMsQ0FBQTtBQUM1RSxnQ0FBbUMsa0RBQWtELENBQUMsQ0FBQTtBQUN0RiwyQkFBdUIsc0NBQXNDLENBQUMsQ0FBQTtBQUM5RCw2QkFBZ0Qsd0NBQXdDLENBQUMsQ0FBQTtBQUN6RixtQ0FBa0MsOENBQThDLENBQUMsQ0FBQTtBQUNqRixtQ0FBK0IsOENBQThDLENBQUMsQ0FBQTtBQUM5RSxnQ0FBNkIsc0NBQXNDLENBQUMsQ0FBQTtBQUNwRSxrQ0FBK0Isd0NBQXdDLENBQUMsQ0FBQTtBQUN4RSx5QkFBa0IsbUJBQW1CLENBQUMsQ0FBQTtBQUN0Qyx5QkFBc0Isd0NBQXdDLENBQUMsQ0FBQTtBQUMvRCw0QkFBMEIsMkNBQTJDLENBQUMsQ0FBQTtBQUN0RSw0QkFBb0MsMkNBQTJDLENBQUMsQ0FBQTtBQUNoRixnQ0FBZ0MsMkJBQTJCLENBQUMsQ0FBQTtBQUM1RCx5QkFBc0Isb0NBQW9DLENBQUMsQ0FBQTtBQUMzRCx5QkFBbUMsc0NBQXNDLENBQUMsQ0FBQTtBQUMxRSx5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QUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFNLENBQUMsQ0FBQztJQUNoQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXZCLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDUCx5Q0FBaUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLElBQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVJlLHVDQUErQixrQ0FROUMsQ0FBQTtBQUVEO0lBQ0UsbUNBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDaEMsa0JBQU8sRUFBRSxDQUFDO0lBQ1YsbUNBQXFCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDL0IsQ0FBQztBQUplLG1DQUEyQiw4QkFJMUMsQ0FBQTtBQUVEO0lBQ0UsTUFBTSxDQUFDLElBQUksdUJBQWdCLENBQUMsaUJBQUcsRUFBRSxDQUFDLGNBQU8sQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFFRDtJQUNFLE1BQU0sQ0FBQyxpQkFBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzFCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFIsIElTX0RBUlR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge1xuICBQTEFURk9STV9ESVJFQ1RJVkVTLFxuICBQTEFURk9STV9QSVBFUyxcbiAgQ29tcG9uZW50UmVmLFxuICBwbGF0Zm9ybSxcbiAgRXhjZXB0aW9uSGFuZGxlcixcbiAgUmVmbGVjdG9yLFxuICByZWZsZWN0b3IsXG4gIEFQUExJQ0FUSU9OX0NPTU1PTl9QUk9WSURFUlMsXG4gIFBMQVRGT1JNX0NPTU1PTl9QUk9WSURFUlMsXG4gIFJvb3RSZW5kZXJlcixcbiAgUExBVEZPUk1fSU5JVElBTElaRVIsXG4gIEFQUF9JTklUSUFMSVpFUlxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7RVZFTlRfTUFOQUdFUl9QTFVHSU5TLCBFdmVudE1hbmFnZXJ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbl9kb20nO1xuaW1wb3J0IHtwcm92aWRlLCBQcm92aWRlciwgSW5qZWN0b3IsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG4vLyBUT0RPIGNoYW5nZSB0aGVzZSBpbXBvcnRzIG9uY2UgZG9tX2FkYXB0ZXIgaXMgbW92ZWQgb3V0IG9mIGNvcmVcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7RG9tRXZlbnRzUGx1Z2lufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2V2ZW50cy9kb21fZXZlbnRzJztcbmltcG9ydCB7S2V5RXZlbnRzUGx1Z2lufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2V2ZW50cy9rZXlfZXZlbnRzJztcbmltcG9ydCB7SGFtbWVyR2VzdHVyZXNQbHVnaW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2hhbW1lcl9nZXN0dXJlcyc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtEb21Sb290UmVuZGVyZXIsIERvbVJvb3RSZW5kZXJlcl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX3JlbmRlcmVyJztcbmltcG9ydCB7RG9tU2hhcmVkU3R5bGVzSG9zdH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3QnO1xuaW1wb3J0IHtTaGFyZWRTdHlsZXNIb3N0fSBmcm9tIFwiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3RcIjtcbmltcG9ydCB7QnJvd3NlckRldGFpbHN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2Jyb3dzZXJfZGV0YWlscyc7XG5pbXBvcnQge0FuaW1hdGlvbkJ1aWxkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2FuaW1hdGlvbl9idWlsZGVyJztcbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9jb21waWxlcic7XG5pbXBvcnQge1hIUkltcGx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9icm93c2VyL3hocl9pbXBsJztcbmltcG9ydCB7VGVzdGFiaWxpdHl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3Rlc3RhYmlsaXR5L3Rlc3RhYmlsaXR5JztcbmltcG9ydCB7QnJvd3NlckdldFRlc3RhYmlsaXR5fSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci90ZXN0YWJpbGl0eSc7XG5pbXBvcnQge0Jyb3dzZXJEb21BZGFwdGVyfSBmcm9tICcuL2Jyb3dzZXIvYnJvd3Nlcl9hZGFwdGVyJztcbmltcG9ydCB7d3RmSW5pdH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcHJvZmlsZS93dGZfaW5pdCc7XG5pbXBvcnQge01lc3NhZ2VCYXNlZFJlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvcmVuZGVyZXInO1xuaW1wb3J0IHtNZXNzYWdlQmFzZWRYSFJJbXBsfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkveGhyX2ltcGwnO1xuaW1wb3J0IHtCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3JvdXRlci9sb2NhdGlvbi9icm93c2VyX3BsYXRmb3JtX2xvY2F0aW9uJztcbmltcG9ydCB7XG4gIFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeSxcbiAgU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5X1xufSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcnZpY2VfbWVzc2FnZV9icm9rZXInO1xuaW1wb3J0IHtcbiAgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnksXG4gIENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5X1xufSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL2NsaWVudF9tZXNzYWdlX2Jyb2tlcic7XG5pbXBvcnQge1NlcmlhbGl6ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplcic7XG5pbXBvcnQge09OX1dFQl9XT1JLRVJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvYXBpJztcbmltcG9ydCB7UmVuZGVyU3RvcmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvcmVuZGVyX3N0b3JlJztcbmltcG9ydCB7SEFNTUVSX0dFU1RVUkVfQ09ORklHLCBIYW1tZXJHZXN0dXJlQ29uZmlnfSBmcm9tICcuL2RvbS9ldmVudHMvaGFtbWVyX2dlc3R1cmVzJztcblxuZXhwb3J0IGNvbnN0IFdPUktFUl9TQ1JJUFQ6IE9wYXF1ZVRva2VuID0gQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oXCJXZWJXb3JrZXJTY3JpcHRcIikpO1xuXG4vLyBNZXNzYWdlIGJhc2VkIFdvcmtlciBjbGFzc2VzIHRoYXQgbGlzdGVuIG9uIHRoZSBNZXNzYWdlQnVzXG5leHBvcnQgY29uc3QgV09SS0VSX1JFTkRFUl9NRVNTQUdJTkdfUFJPVklERVJTOiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPiA9XG4gICAgQ09OU1RfRVhQUihbTWVzc2FnZUJhc2VkUmVuZGVyZXIsIE1lc3NhZ2VCYXNlZFhIUkltcGxdKTtcblxuZXhwb3J0IGNvbnN0IFdPUktFUl9SRU5ERVJfUExBVEZPUk06IEFycmF5PGFueSAvKlR5cGUgfCBQcm92aWRlciB8IGFueVtdKi8+ID0gQ09OU1RfRVhQUihbXG4gIFBMQVRGT1JNX0NPTU1PTl9QUk9WSURFUlMsXG4gIG5ldyBQcm92aWRlcihQTEFURk9STV9JTklUSUFMSVpFUiwge3VzZVZhbHVlOiBpbml0V2ViV29ya2VyUmVuZGVyUGxhdGZvcm0sIG11bHRpOiB0cnVlfSlcbl0pO1xuXG4vKipcbiAqIEEgbGlzdCBvZiB7QGxpbmsgUHJvdmlkZXJ9cy4gVG8gdXNlIHRoZSByb3V0ZXIgaW4gYSBXb3JrZXIgZW5hYmxlZCBhcHBsaWNhdGlvbiB5b3UgbXVzdFxuICogaW5jbHVkZSB0aGVzZSBwcm92aWRlcnMgd2hlbiBzZXR0aW5nIHVwIHRoZSByZW5kZXIgdGhyZWFkLlxuICovXG5leHBvcnQgY29uc3QgV09SS0VSX1JFTkRFUl9ST1VURVI6IEFycmF5PGFueSAvKlR5cGUgfCBQcm92aWRlciB8IGFueVtdKi8+ID1cbiAgICBDT05TVF9FWFBSKFtCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbl0pO1xuXG5leHBvcnQgY29uc3QgV09SS0VSX1JFTkRFUl9BUFBMSUNBVElPTl9DT01NT046IEFycmF5PGFueSAvKlR5cGUgfCBQcm92aWRlciB8IGFueVtdKi8+ID0gQ09OU1RfRVhQUihbXG4gIEFQUExJQ0FUSU9OX0NPTU1PTl9QUk9WSURFUlMsXG4gIFdPUktFUl9SRU5ERVJfTUVTU0FHSU5HX1BST1ZJREVSUyxcbiAgbmV3IFByb3ZpZGVyKEV4Y2VwdGlvbkhhbmRsZXIsIHt1c2VGYWN0b3J5OiBfZXhjZXB0aW9uSGFuZGxlciwgZGVwczogW119KSxcbiAgbmV3IFByb3ZpZGVyKERPQ1VNRU5ULCB7dXNlRmFjdG9yeTogX2RvY3VtZW50LCBkZXBzOiBbXX0pLFxuICAvLyBUT0RPKGp0ZXBsaXR6NjAyKTogSW52ZXN0aWdhdGUgaWYgd2UgZGVmaW5pdGVseSBuZWVkIEVWRU5UX01BTkFHRVIgb24gdGhlIHJlbmRlciB0aHJlYWRcbiAgLy8gIzUyOThcbiAgbmV3IFByb3ZpZGVyKEVWRU5UX01BTkFHRVJfUExVR0lOUywge3VzZUNsYXNzOiBEb21FdmVudHNQbHVnaW4sIG11bHRpOiB0cnVlfSksXG4gIG5ldyBQcm92aWRlcihFVkVOVF9NQU5BR0VSX1BMVUdJTlMsIHt1c2VDbGFzczogS2V5RXZlbnRzUGx1Z2luLCBtdWx0aTogdHJ1ZX0pLFxuICBuZXcgUHJvdmlkZXIoRVZFTlRfTUFOQUdFUl9QTFVHSU5TLCB7dXNlQ2xhc3M6IEhhbW1lckdlc3R1cmVzUGx1Z2luLCBtdWx0aTogdHJ1ZX0pLFxuICBuZXcgUHJvdmlkZXIoSEFNTUVSX0dFU1RVUkVfQ09ORklHLCB7dXNlQ2xhc3M6IEhhbW1lckdlc3R1cmVDb25maWd9KSxcbiAgbmV3IFByb3ZpZGVyKERvbVJvb3RSZW5kZXJlciwge3VzZUNsYXNzOiBEb21Sb290UmVuZGVyZXJffSksXG4gIG5ldyBQcm92aWRlcihSb290UmVuZGVyZXIsIHt1c2VFeGlzdGluZzogRG9tUm9vdFJlbmRlcmVyfSksXG4gIG5ldyBQcm92aWRlcihTaGFyZWRTdHlsZXNIb3N0LCB7dXNlRXhpc3Rpbmc6IERvbVNoYXJlZFN0eWxlc0hvc3R9KSxcbiAgbmV3IFByb3ZpZGVyKFhIUiwge3VzZUNsYXNzOiBYSFJJbXBsfSksXG4gIE1lc3NhZ2VCYXNlZFhIUkltcGwsXG4gIG5ldyBQcm92aWRlcihTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnksIHt1c2VDbGFzczogU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5X30pLFxuICBuZXcgUHJvdmlkZXIoQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnksIHt1c2VDbGFzczogQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnlffSksXG4gIFNlcmlhbGl6ZXIsXG4gIG5ldyBQcm92aWRlcihPTl9XRUJfV09SS0VSLCB7dXNlVmFsdWU6IGZhbHNlfSksXG4gIFJlbmRlclN0b3JlLFxuICBEb21TaGFyZWRTdHlsZXNIb3N0LFxuICBUZXN0YWJpbGl0eSxcbiAgQnJvd3NlckRldGFpbHMsXG4gIEFuaW1hdGlvbkJ1aWxkZXIsXG4gIEV2ZW50TWFuYWdlclxuXSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplR2VuZXJpY1dvcmtlclJlbmRlcmVyKGluamVjdG9yOiBJbmplY3Rvcikge1xuICB2YXIgYnVzID0gaW5qZWN0b3IuZ2V0KE1lc3NhZ2VCdXMpO1xuICBsZXQgem9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuICBidXMuYXR0YWNoVG9ab25lKHpvbmUpO1xuXG4gIHpvbmUucnVuKCgpID0+IHtcbiAgICBXT1JLRVJfUkVOREVSX01FU1NBR0lOR19QUk9WSURFUlMuZm9yRWFjaCgodG9rZW4pID0+IHsgaW5qZWN0b3IuZ2V0KHRva2VuKS5zdGFydCgpOyB9KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0V2ViV29ya2VyUmVuZGVyUGxhdGZvcm0oKTogdm9pZCB7XG4gIEJyb3dzZXJEb21BZGFwdGVyLm1ha2VDdXJyZW50KCk7XG4gIHd0ZkluaXQoKTtcbiAgQnJvd3NlckdldFRlc3RhYmlsaXR5LmluaXQoKTtcbn1cblxuZnVuY3Rpb24gX2V4Y2VwdGlvbkhhbmRsZXIoKTogRXhjZXB0aW9uSGFuZGxlciB7XG4gIHJldHVybiBuZXcgRXhjZXB0aW9uSGFuZGxlcihET00sICFJU19EQVJUKTtcbn1cblxuZnVuY3Rpb24gX2RvY3VtZW50KCk6IGFueSB7XG4gIHJldHVybiBET00uZGVmYXVsdERvYygpO1xufVxuIl19