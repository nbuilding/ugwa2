const EARLIEST_AM_HOUR = 6;

const HTMLnewlineRegex = /<(p|div).*?>/g;
const noHTMLRegex = /<.*?>/g;
const noNbspRegex = /&nbsp;/g;
const parserRegex = /(?:\n|,|\))(.*?)\(?(1?[0-9]):([0-9]{2})-(1?[0-9]):([0-9]{2})(?=\))?/g;
const getPeriodLetterRegex = /\b[A-G]\b/;

function parseAlternate(summary, description) {
  if (/(schedule|extended)/i.test(summary)) {
    if (!description) return "/srig";
    description = "\n" + description.replace(HTMLnewlineRegex, "\n").replace(noHTMLRegex, "").replace(noNbspRegex, " ");
    let periods = [];
    description.replace(parserRegex, (m, name, sH, sM, eH, eM) => {
      name = name.trim();
      if (!name) return;

      sH = +sH; sM = +sM; eH = +eH; eM = +eM;
      if (sH < EARLIEST_AM_HOUR) sH += 12;
      if (eH < EARLIEST_AM_HOUR) eH += 12;
      let startTime = sH * 60 + sM,
      endTime = eH * 60 + eM;

      let duplicatePeriod = periods.findIndex(p => p.start === startTime);
      if (~duplicatePeriod) {
        periods[duplicatePeriod].original += "\n" + name;
      } else {
        // customise your format here
        periods.push({
          period: identifyPeriod(name),
          start: startTime,
          end: endTime
        });
      }
    });
    return periods;
  } else if (/(holiday|no\sstudents|break)/i.test(summary)) {
    return null;
  }
}

function identifyPeriod(name) {
  name = name.toUpperCase();
  if (~name.indexOf("PERIOD")) {
    let letter = getPeriodLetterRegex.exec(name);
    if (letter) return letter[0];
  }
  if (~name.indexOf("FLEX")
      || ~name.indexOf("SELF")
      || ~name.indexOf("ASSEMBLY")
      || ~name.indexOf("TUTORIAL"))
    return "FLEX";
  else if (~name.indexOf("COLLABORATION")) return "STAFF_COLLAB";
  else if (~name.indexOf("MEETING")) return "STAFF_MEETINGS";
  else if (~name.indexOf("BRUNCH") || ~name.indexOf("BREAK")) return "BRUNCH";
  else if (~name.indexOf("LUNCH")) return "LUNCH";
  else return;
}
