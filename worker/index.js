const HOST_CANONICO = "specificdata.dev";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname.endsWith(".workers.dev")) {
      url.protocol = "https:";
      url.hostname = HOST_CANONICO;
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
