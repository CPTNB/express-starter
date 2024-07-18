// this `FernApi` export is generated from your organization name in fern.config.json:
import { HelloService } from "../api/generated/api/resources/hello/service/HelloService";

export default new HelloService({
  get:(req, res) => { "hello werld"}
});
