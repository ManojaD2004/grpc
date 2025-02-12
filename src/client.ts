import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const protoPath = path.join(process.cwd(), "./protos/helloworld.proto");

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

type HelloResponse = {
  message: string;
};

const helloProto = grpc.loadPackageDefinition(packageDefinition)
  .helloworld as grpc.GrpcObject;

async function main() {
  const greeter =
    helloProto.Greeter as unknown as grpc.ServiceClientConstructor;
  const client = new greeter(
    "localhost:5051",
    grpc.credentials.createInsecure()
  );
  client.sayHello({ name: "Manoja" }, function (err: null | Error, response: HelloResponse) {
    console.log("Greeting:", response.message);
  });
  console.log("Hi");
}

main();
