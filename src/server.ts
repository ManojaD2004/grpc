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

const helloProto = grpc.loadPackageDefinition(packageDefinition).helloworld as grpc.GrpcObject;

type HelloRequest = {
  name: string;
};

type HelloResponse = {
  message: string;
};

function sayHello(
  call: { request: HelloRequest },
  callback: (err: null | Error, data: HelloResponse) => void
) {
  console.log("Hit sayHello");
  callback(null, { message: `Hello ${call.request.name} welcome to gRPC` });
}

async function main() {
  const server = new grpc.Server();
  const greeter =
    helloProto.Greeter as unknown as grpc.ServiceClientConstructor;
  server.addService(greeter.service, { sayHello: sayHello });
  server.bindAsync(
    "0.0.0.0:5051",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("Server started");
    }
  );
  console.log("Hi");
}

main();
