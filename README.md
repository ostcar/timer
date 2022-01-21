# Timer

Timer is a time tracking software with a web frontend.


## Server

To build the server, just call

```
go build
```

Afterwards you can start it with

```
./timer
```

It will create the file `db.jsonl` which is the database.


## GRPC Client

The grpc Client is called timeme. You can build it with

```
go build ./cmd/timeme
```

and start it with

```
./timeme
```


## Web Client

Comming soon.
