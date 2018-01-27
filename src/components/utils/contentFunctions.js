

  export function iconForType(type) {
    if (type === 'product') {
      return 'rocket';
    } else if (type === 'event') {
      return 'ticket';
    } else if (type === 'place') {
      return 'marker';
    } else if (type === 'promo') {
      return 'percent';
    }
  }

  export function nameForType(type, plural = false) {
    if (!plural) {
      if (type === 'product') {
        return 'Продукт';
      } else if (type === 'event') {
        return 'Ивент';
      } else if (type === 'place') {
        return 'Место';
      } else if (type === 'promo') {
        return 'Промоакция';
      }
    } else {
      if (type === 'product') {
        return 'Продукты';
      } else if (type === 'event') {
        return 'Ивенты';
      } else if (type === 'place') {
        return 'Места';
      } else if (type === 'promo') {
        return 'Промоакции';
      }
    }

  }

  export function randomColor() {
    var colors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black'];
    return colors[Math.floor(Math.random()*colors.length)];
  }

  export function getRandomItemsFromArray(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len;
    }
    return result;
}
