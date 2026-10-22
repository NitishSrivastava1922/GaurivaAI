import proxy from "express-http-proxy";

export const proxyWithHeaders = (serviceUrl) => {
  return proxy(serviceUrl, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {

      if (srcReq.user?.uid) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.uid;
      }

      return proxyReqOpts;
    },
  });
};