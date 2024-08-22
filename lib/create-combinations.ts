import fs from "fs";
import path from "path";
import sharp from "sharp";

const getFilesInDirectory = (dirPath: string): string[] => {
  return fs.readdirSync(dirPath).filter((file: string) => {
    return fs.statSync(path.join(dirPath, file)).isFile();
  });
};

const saveJSON = (data: any, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
};

const filterList = (files: string[], name: string) => {
  return files
    .filter((file) => file.startsWith(name))
    .map((t) => t.replace(".webp", "").replace(name + "-", ""));
};

// get each part file from `public/parts` directory
// eye would be `eyes-${eye}.webp`, etc
// stack each image on top of each other with sharp
// write the new image to `public/pfps` directory
const flattenParts = (eye: string, mouth: string, head: string) => {
  const eyePath = `./public/parts/eyes-${eye}.webp`;
  const mouthPath = `./public/parts/mouth-${mouth}.webp`;
  const headPath = `./public/parts/head-${head}.webp`;
  const outputPath = `./public/pfps/${eye}-${mouth}-${head}.webp`;

  sharp(headPath)
    .composite([{ input: mouthPath }, { input: eyePath }])
    .toFile(outputPath, (err) => {
      if (err) {
        console.error(err);
      }
    });
};

const files = getFilesInDirectory("./public/parts");
const eyes = filterList(files, "eyes");
const heads = filterList(files, "head");
const mouths = filterList(files, "mouth");
const combinations: string[] = [];

for (const eye of eyes) {
  for (const mouth of mouths) {
    for (const head of heads) {
      combinations.push(`${eye}:${mouth}:${head}`);
      flattenParts(eye, mouth, head);
    }
  }
}

saveJSON({ eyes, heads, mouths, files }, "./public/parts.json");
saveJSON(combinations, "./public/pfps.json");
