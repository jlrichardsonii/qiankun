/**
 * @author Kuitos
 * @since 2020-04-13
 */
declare global {
    interface Window {
        __currentRunningSandboxProxy__: WindowProxy | null;
    }
}
export declare function getCurrentRunningSandboxProxy(): Window | null;
export declare function setCurrentRunningSandboxProxy(proxy: WindowProxy | null): void;
export declare function getTargetValue(target: any, value: any): any;
export declare function getProxyPropertyValue(getter: CallableFunction): any;
