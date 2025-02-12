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

function waitForNSeconds(seconds: number) {
  return new Promise((res, _) => {
    setTimeout(() => {
      res(`waited for ${seconds} seconds`);
    }, 1000 * seconds);
  });
}

async function main() {
  const greeter =
    helloProto.Greeter as unknown as grpc.ServiceClientConstructor;
  const client = new greeter(
    "localhost:5051",
    grpc.credentials.createInsecure()
  );

  const a = client.sayHello(
    { name: "Manoja" },
    function (err: null | Error, response: HelloResponse) {
      console.log("Greeting:", response);
    }
  );
  const b = client.sayHelloStreamReply({ name: "Manoja D" });
  b.on("data", function (msg: any) {
    console.log(msg);
  });
  b.on("end", function () {
    console.log("Ended");
  });
  b.on("error", function (e: any) {
    console.log(e);
  });
  b.on("status", function (status: any) {
    console.log(status);
  });
  await waitForNSeconds(5);
  const c = client.sayHelloStreamResponse(function (error: any, stats: any) {
    if (error) {
      console.log(error);
    }
    console.log("in", stats);
  });
  for (let index = 0; index < 5; index++) {
    await waitForNSeconds(1);
    console.log(index);
    c.write({ name: "Manu Warr" });
  }
  c.end();
  const d = client.sayHelloStreamBi();
  d.on("data", function (msg: any) {
    console.log(msg);
  });
  d.on("end", function () {
    console.log("Ended");
  });
  d.on("error", function (e: any) {
    console.log(e);
  });
  d.on("status", function (status: any) {
    console.log(status);
  });
  for (let index = 0; index < 5; index++) {
    await waitForNSeconds(1);
    console.log(index);
    d.write({ name: "Manu Warr 2004" });
  }
  await waitForNSeconds(2);
  d.end();
}

main();
