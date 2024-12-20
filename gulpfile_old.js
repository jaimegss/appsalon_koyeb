import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import { src, dest, watch, series, parallel } from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import terser from 'gulp-terser';
import sharp from 'sharp';

const sass = gulpSass(dartSass);

const paths = {
    scss: 'src/scss/**/*.scss',
    js: 'src/js/**/*.js'
};

export function css() {
    return src(paths.scss, { sourcemaps: true })
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(dest('./public/build/css', { sourcemaps: '.' }));
}

export function javascript() {
    return src(paths.js)
        .pipe(terser())
        .pipe(dest('./public/build/js'));
}

export async function imagenes() {
    const srcDir = './src/img';
    const buildDir = './public/build/img';
    const images = await glob('./src/img/**/*');

    images.forEach(file => {
        const relativePath = path.relative(srcDir, path.dirname(file));
        const outputSubDir = path.join(buildDir, relativePath);
        procesarImagenes(file, outputSubDir);
    });
}

function procesarImagenes(file, outputSubDir) {
    if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true });
    }
    const baseName = path.basename(file, path.extname(file));
    const extName = path.extname(file);

    if (extName.toLowerCase() === '.svg') {
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        fs.copyFileSync(file, outputFile);
    } else {
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`);
        const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`);
        const options = { quality: 80 };

        sharp(file).jpeg(options).toFile(outputFile);
        sharp(file).webp(options).toFile(outputFileWebp);
        sharp(file).avif().toFile(outputFileAvif);
    }
}

export function versionWebp() {
    return src('./src/img/**/*.{png,jpg}')
        .pipe(sharp().webp({ quality: 80 }))
        .pipe(dest('./public/build/img'));
}

export function watchArchivos() {
    watch(paths.scss, css);
    watch(paths.js, javascript);
    watch('src/img/**/*.{png,jpg}', imagenes);
}

export default series(javascript, css, imagenes, watchArchivos);

exports.css = css;
exports.watchArchivos = watchArchivos;
exports.default = parallel(css, javascript, imagenes, versionWebp, watchArchivos);
exports.build = parallel(css, javascript, imagenes, versionWebp);