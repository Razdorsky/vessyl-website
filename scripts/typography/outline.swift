import Foundation
import CoreText
import CoreGraphics
let input=URL(fileURLWithPath:CommandLine.arguments[1]); let output=URL(fileURLWithPath:CommandLine.arguments[2])
let jobs=try JSONSerialization.jsonObject(with:Data(contentsOf:input)) as! [[String:Any]]
// Fonts remain outside the repository. Register the supplied local files for this process only.
guard CommandLine.arguments.count == 5 else { fatalError("Usage: swift outline.swift jobs.json output-directory regular.ttf bold.ttf") }
for path in CommandLine.arguments[3...4] {
 CTFontManagerRegisterFontsForURL(URL(fileURLWithPath:path) as CFURL,.process,nil)
}
func num(_ v:CGFloat)->String {String(format:"%.2f",Double(v))}
var result:[[String:Any]]=[]
for job in jobs {
 let text=job["text"] as! String; let size=job["size"] as! Double; let width=job["width"] as! Double
 let font=CTFontCreateWithName((job["weight"] as! Int == 700 ? "TeluguMN-Bold" : "TeluguMN") as CFString,size,nil)
 let actual=CTFontCopyPostScriptName(font) as String
 guard actual.hasPrefix("TeluguMN") else {fatalError("Wrong font: \(actual)")}
 let attr=NSAttributedString(string:text,attributes:[NSAttributedString.Key(kCTFontAttributeName as String):font])
 let typesetter=CTTypesetterCreateWithAttributedString(attr);var start=0;var y=CGFloat(size)*1.15;var paths:[String]=[]
 while start<attr.length {
  let count=CTTypesetterSuggestLineBreak(typesetter,start,width-8)
  guard count>0 else {fatalError("Line wrapping failed")}
  let line=CTTypesetterCreateLine(typesetter,CFRange(location:start,length:count))
  let runs=CTLineGetGlyphRuns(line) as! [CTRun]
  for run in runs {
   let n=CTRunGetGlyphCount(run);var glyphs=[CGGlyph](repeating:0,count:n);var positions=[CGPoint](repeating:.zero,count:n)
   CTRunGetGlyphs(run,CFRange(location:0,length:0),&glyphs);CTRunGetPositions(run,CFRange(location:0,length:0),&positions)
   for i in 0..<n {
    guard let path=CTFontCreatePathForGlyph(font,glyphs[i],nil) else {continue}
    var d=""; let position = positions[i]
    path.applyWithBlock { item in
     let e=item.pointee;let p=e.points
     func pt(_ i:Int)->String {num(p[i].x+position.x+4)+" "+num(y-p[i].y-position.y)}
     switch e.type {case .moveToPoint:d+="M"+pt(0);case .addLineToPoint:d+="L"+pt(0);case .addQuadCurveToPoint:d+="Q"+pt(0)+" "+pt(1);case .addCurveToPoint:d+="C"+pt(0)+" "+pt(1)+" "+pt(2);case .closeSubpath:d+="Z";@unknown default:break}
    }
    paths.append("<path d=\""+d+"\"/>")
   }
  }
  start+=count;y+=CGFloat(size)*1.16
 }
 let height=Double(y-CGFloat(size)*0.9)
 let svg="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 \(width) \(height)\" width=\"\(width)\" height=\"\(height)\"><g fill=\"#000000\">"+paths.joined()+"</g></svg>"
 let file=job["file"] as! String
 try svg.write(to:output.appendingPathComponent(file),atomically:true,encoding:.utf8)
 result.append(["file":file,"width":width,"height":height,"font":actual])
}
let data=try JSONSerialization.data(withJSONObject:result,options:[.prettyPrinted,.sortedKeys]);FileHandle.standardOutput.write(data)
