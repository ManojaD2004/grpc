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

const helloProto = grpc.loadPackageDefinition(packageDefinition)
  .helloworld as grpc.GrpcObject;

type HelloRequest = {
  name: string;
};

type HelloResponse = {
  message: string;
  status?: any;
};

function sayHello(
  call: { request: HelloRequest },
  callback: (err: null | Error, data: HelloResponse) => void
) {
  console.log("Hit sayHello");
  callback(null, {
    message: `Hello ${call.request.name} welcome to gRPC`,
  });
}

function waitForNSeconds(seconds: number) {
  return new Promise((res, _) => {
    setTimeout(() => {
      res(`waited for ${seconds} seconds`);
    }, 1000 * seconds);
  });
}

async function sayHelloStreamReply(call: {
  request: HelloRequest;
  write: (a?: any) => void;
  end: () => void;
  on: (event: string, fn: () => void) => void;
}) {
  for (let index = 0; index < 5; index++) {
    console.log(index);
    await waitForNSeconds(1);
    call.write({ message: `Hello ${call.request.name} welcome to gRPC` });
  }
  call.end();
}

async function sayHelloStreamBi(call: {
  request: HelloRequest;
  write: (a?: any) => void;
  end: () => void;
  on: (event: string, fn: (a?: any) => void) => void;
}) {
  call.on("data", async (a) => {
    console.log(a);
    await waitForNSeconds(1);
    console.log("Sending..");
    call.write({ message: a.name });
  });
  call.on("end", () => {
    call.end();
  });
}

async function sayHelloStreamResponse(
  call: {
    request: HelloRequest;
    on: (event: string, fn: (a?: any) => void) => void;
  },
  callback: (err: null | Error, data: any) => void
) {
  const b: any[] = [];
  console.log("In");
  call.on("data", (a) => {
    console.log(a);
    b.push({ message: a.name });
  });
  call.on("end", () => {
    callback(null, { replies: b });
  });
}

async function main() {
  const server = new grpc.Server();
  const greeter =
    helloProto.Greeter as unknown as grpc.ServiceClientConstructor;
  server.addService(greeter.service, {
    sayHello: sayHello,
    sayHelloStreamReply: sayHelloStreamReply,
    sayHelloStreamResponse: sayHelloStreamResponse,
    sayHelloStreamBi: sayHelloStreamBi,
  });
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
