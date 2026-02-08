_settings = {
    'index_track_ls_var': "_smreader_last_chunk",
    'db_name': 'smreader-books',
    'store_name': 'books',
    'index_name': "book_title",
    'index_field': "book_title",
    'db_version': 1,
    'max_chunks': 49,
}

// stolen shuffle function
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

// run this when the page is ready
function load_runner() {
    _max_chunks = _settings['max_chunks']
    return new Promise(async(resolve, reject) => {
        // set up the db
        await setup_db();
        // what's the last book number we loaded?'
        let to_load = get_next_chunk_index();
        if (to_load == -1) {
            console.info("I think I have all the books already")
            resolve();
        } else {
            console.log("loading", to_load)
            await insert_chunk(to_load);
            console.log("probably loaded", to_load)
            set_next_chunk_index(to_load);
            await load_runner();
            resolve();
        }
    });
}

function get_next_chunk_index() {
    __INDEX_TRACK_VAR = _settings['index_track_ls_var'];
    this_index = parseInt(window.localStorage.getItem(__INDEX_TRACK_VAR), 10)
    max_index = parseInt(_settings['max_chunks'], 10)
    if (isNaN(this_index)) {
        return 0;
    } else if (this_index < max_index) {
        return this_index + 1;
    } else {
        return -1 // done ;
    }
}

function set_next_chunk_index(to){
    __INDEX_TRACK_VAR = _settings['index_track_ls_var'];
    this_index = parseInt(window.localStorage.getItem(__INDEX_TRACK_VAR), 10)
    if (to > this_index){
        window.localStorage.setItem(__INDEX_TRACK_VAR, to);
    }
    return to + 1;
}

// setup indexeddb
function setup_db() {
    const db_name = _settings['db_name'];
    const version = _settings['db_version'];
    const store_name = _settings['store_name'];
    const index_name = _settings['index_name'];
    const index_field = _settings['index_field'];
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(db_name, version);
        request.onerror = () => reject(request.error);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            const store = db.createObjectStore(store_name, {
                keyPath: "etextno"
            });
            store.createIndex(index_name, index_field, {
                unique: false
            });
        };
        request.onsuccess = (e) => {
            console.log(e)
            resolve(e.target.result);
        }
        request.onerror = (e) => {
            console.error(e)
            reject(e)
        }
    });
}

function idb_get_item(id){
    const db_name = _settings['db_name'];
    const version = _settings['db_version'];
    const store_name = _settings['store_name'];
    return new Promise(async(resolve, reject) => {
        var openRequest = indexedDB.open(db_name, version);
        openRequest.onerror = (e) => {
            console.error(e)
            reject(error);
        }
        openRequest.onsuccess = (e) => {
            const db = e.target.result;
            transaction = db.transaction([store_name], "readonly");
            const objectStore = transaction.objectStore(store_name);
            req = objectStore.get(id)
            req.onsuccess = (e) => {
                resolve(req.result);
            }
        }
    });
}

function get_book_keys(){
    const db_name = _settings['db_name'];
    const version = _settings['db_version'];
    const store_name = _settings['store_name'];
    const index_name = _settings['index_name'];
    return new Promise(async(resolve, reject) => {
        var openRequest = indexedDB.open(db_name, version);
        openRequest.onerror = (e) => {
            console.error(e)
            reject(error);
        }
        openRequest.onsuccess = (e) => {
            const db = e.target.result;
            transaction = db.transaction([store_name], "readonly");
            const objectStore = transaction.objectStore(store_name);
            const index = objectStore.index(index_name);
            req = index.getAllKeys();
            req.onsuccess = (e) => {
                resolve(req.result);
            }
        }
        openRequest.onerror = (e) => {
            reject(e);
        }
    });
}

function insert_chunk(index) {
    const db_name = _settings['db_name'];
    const version = _settings['db_version'];
    const store_name = _settings['store_name'];
    return new Promise(async(resolve, reject) => {
        let res = await (await fetch('./books/books_' + index + '.json')).json();
        console.log('res', res)
        const request = window.indexedDB.open(db_name, version);
        request.onsuccess = async (e) => {
            const db = e.target.result;
            transaction = db.transaction([store_name], "readwrite");
            const objectStore = transaction.objectStore(store_name);
            transaction.oncomplete = function(e) {
                console.log("db add success", e);
            };
            transaction.onerror = function(e) {
                console.log("db add fail; aborting", e);
                transaction.abort();
                reject(e);
            }

            // the meat
            batch_arr = res.map(book => {
                return new Promise((res, rej) => {
                    book_add_req = objectStore.put(book);
                    book_add_req.onsuccess = (e) => {
                        res();
                    }
                    book_add_req.onerror = (e) => {
                        console.error("Error with book", book);
                        rej();
                    }
                }) 
            });
            Promise.all(batch_arr).then((x)=>{
                console.log(x)
                resolve();
            });
            
        };
        request.onerror = (e) => {
            reject(e);
        }
        
    });
}