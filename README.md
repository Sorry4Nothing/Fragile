# Fragile
TBZ Project Modul 426

### Instructions to build and start frontend
1. ```npm install```
1. ```npm run clean:types```
1. ```npm run lock:types```
1. ```npm run build:types```
1. ```npm start```

##### Solution for Error glib not found or similar (Arch)
```sudo pacman -S gobject-introspection```

##### Solution for Error blueprint-compiler not found (Arch)
```sudo pacman -S blueprint-compiler```

### Instructions to start backend
1. Create config.json with help of config.example.json
1. Run ```node server.js```
