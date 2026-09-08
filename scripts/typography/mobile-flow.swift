import Foundation
import CoreText
import CoreGraphics

// Export word outlines, not fonts. The browser wraps these at its actual width.
guard CommandLine.arguments.count == 5 else {
 fatalError("Usage: mobile-flow.swift jobs.json output-directory regular.ttf bold.ttf")
}
for path in CommandLine.arguments[3...4] {
 CTFontManagerRegisterFontsForURL(URL(fileURLWithPath: path) as CFURL, .process, nil)
}
let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let jobs = try JSONSerialization.jsonObject(with: Data(contentsOf: input)) as! [[String: Any]]
func num(_ value: CGFloat) -> String { String(format: "%.3f", Double(value)) }
var result: [[String: Any]] = []
for job in jobs {
 let size = job["size"] as! Double
 let font = CTFontCreateWithName((job["weight"] as! Int == 700 ? "TeluguMN-Bold" : "TeluguMN") as CFString, size, nil)
 guard (CTFontCopyPostScriptName(font) as String).hasPrefix("TeluguMN") else { fatalError("Wrong font") }
 let attributes = [NSAttributedString.Key(kCTFontAttributeName as String): font]
 let space = CTLineCreateWithAttributedString(NSAttributedString(string: " ", attributes: attributes))
 let spaceWidth = CTLineGetTypographicBounds(space, nil, nil, nil)
 let lineHeight = size * 1.16
 let baseline = size * 0.94
 var symbols: [String] = []
 var words: [[String: Any]] = []
 for (index, word) in (job["text"] as! String).split(whereSeparator: { $0.isWhitespace }).enumerated() {
  let line = CTLineCreateWithAttributedString(NSAttributedString(string: String(word), attributes: attributes))
  let width = ceil(CTLineGetTypographicBounds(line, nil, nil, nil) * 1000) / 1000
  var paths: [String] = []
  for run in CTLineGetGlyphRuns(line) as! [CTRun] {
   let runFont = (CTRunGetAttributes(run) as NSDictionary)[kCTFontAttributeName] as! CTFont
   let count = CTRunGetGlyphCount(run)
   var glyphs = [CGGlyph](repeating: 0, count: count)
   var positions = [CGPoint](repeating: .zero, count: count)
   CTRunGetGlyphs(run, CFRange(location: 0, length: 0), &glyphs)
   CTRunGetPositions(run, CFRange(location: 0, length: 0), &positions)
   for i in 0..<count {
    guard let path = CTFontCreatePathForGlyph(runFont, glyphs[i], nil) else { continue }
    let position = positions[i]
    var d = ""
    path.applyWithBlock { item in
     let element = item.pointee
     let p = element.points
     func point(_ n: Int) -> String { num(p[n].x + position.x) + " " + num(baseline - p[n].y - position.y) }
     switch element.type {
     case .moveToPoint: d += "M" + point(0)
     case .addLineToPoint: d += "L" + point(0)
     case .addQuadCurveToPoint: d += "Q" + point(0) + " " + point(1)
     case .addCurveToPoint: d += "C" + point(0) + " " + point(1) + " " + point(2)
     case .closeSubpath: d += "Z"
     @unknown default: break
     }
    }
    paths.append("<path d=\"" + d + "\"/>")
   }
  }
  let id = "word-\(index)"
  symbols.append("<symbol id=\"\(id)\" viewBox=\"0 0 \(width) \(lineHeight)\" overflow=\"visible\">" + paths.joined() + "</symbol>")
  words.append(["width": width])
 }
 let file = job["file"] as! String
 let svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"><defs>" + symbols.joined() + "</defs></svg>"
 try svg.write(to: output.appendingPathComponent(file), atomically: true, encoding: .utf8)
 result.append(["file": file, "size": size, "lineHeight": lineHeight, "spaceWidth": spaceWidth, "words": words])
}
let data = try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
FileHandle.standardOutput.write(data)
