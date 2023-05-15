const express = require('express')
const fs = require('fs')


const app = express();


const videoFileMap = {
    'diablo': 'videos/diablo.mp4',
    'sekiro': 'videos/sekiro.mp4',
    'witcher': 'videos/witcher.mp4',
    'eldenring': 'videos/eldenring.mp4',
}


app.get('/video/:filename', (req, res) => {
    const fileName = req.params.filename
    const filePath = videoFileMap[fileName]

    if(!filePath)
        return res.status(404).send("File not found!")

    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const range = req.headers.range

    if(range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        console.log("================ start ================", start)
        console.log("================ end ================", end)

        const chunkSize = end - start + 1;
        const file = fs.createReadStream(filePath, {start, end});

        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Range': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(206, head);
        file.pipe(res)
    } else {
        const file = fs.createReadStream(filePath);
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(200, head);
        file.pipe(res)
    }
})


app.listen(5000, "192.168.0.108", () => {
    console.log("Server is listening on port 5000.")
})