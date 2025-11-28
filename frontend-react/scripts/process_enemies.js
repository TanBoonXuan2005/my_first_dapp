
import { Jimp } from "jimp";
import path from "path";
import fs from "fs";

const ASSETS_BASE = path.join(process.cwd(), "public/assets/animation_frames");
const TASKS = [
    { dir: "Adenovirus", files: ["Adenovirus.png", "Adenovirus (death).png"] },
    { dir: "HIV", files: ["HIV.png", "HIV death.png"] }
];

async function processImage(dirName, filename) {
    const filePath = path.join(ASSETS_BASE, dirName, filename);

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    console.log(`Processing ${dirName}/${filename}...`);

    try {
        const image = await Jimp.read(filePath);

        // Resize to 200px width if larger
        if (image.bitmap.width > 200) {
            console.log(`Resizing ${filename} from ${image.bitmap.width}px to 200px`);
            image.resize({ w: 200 });
        }

        // Remove white background
        // We'll scan pixels and set alpha to 0 for white-ish pixels
        const threshold = 30; // Tolerance for "white"

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            // Check if pixel is white-ish
            if (red > 255 - threshold && green > 255 - threshold && blue > 255 - threshold) {
                this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
            }
        });

        await image.write(filePath);
        console.log(`Successfully processed ${filename}`);

    } catch (err) {
        console.error(`Error processing ${filename}:`, err);
    }
}

async function main() {
    for (const task of TASKS) {
        for (const file of task.files) {
            await processImage(task.dir, file);
        }
    }
}

main();
