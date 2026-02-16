'use client';

import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket, Music2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="overflow-hidden">
        {/* Background gradient */}
        <div className="container absolute inset-0  from-primary/10 via-background to-secondary/10" />
        
        <div className="container relative mx-auto px-4 py-10">

          {/* <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>ลงทะเบียนฟรี ไม่มีค่าใช้จ่าย</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              คอนเสิร์ตฟรี
              <br />
              <span className="text-primary">สำหรับทุกคน</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ค้นพบคอนเสิร์ตและงานดนตรีฟรีที่ใกล้คุณ 
              ลงทะเบียนง่ายๆ เพียงไม่กี่คลิก
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="text-base" asChild>
                <Link href="/concerts">
                  <Ticket className="h-5 w-5 mr-2" />
                  ดูคอนเสิร์ตทั้งหมด
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link href="/about">
                  เรียนรู้เพิ่มเติม
                </Link>
              </Button>
            </div>
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ทำไมต้องเลือกเรา?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-background rounded-lg p-6 shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">บัตรฟรี 100%</h3>
              <p className="text-muted-foreground">
                ไม่มีค่าใช้จ่ายแอบแฝง ลงทะเบียนและรับบัตรฟรีทันที
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-lg p-6 shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ค้นหาได้ง่าย</h3>
              <p className="text-muted-foreground">
                ค้นหาคอนเสิร์ตใกล้บ้านคุณด้วยระบบค้นหาที่ใช้งานง่าย
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-lg p-6 shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Music2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">หลากหลายศิลปิน</h3>
              <p className="text-muted-foreground">
                ศิลปินทุกแนวเพลง จากทุกสไตล์ดนตรีที่คุณชื่นชอบ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 bg-primary/5 rounded-2xl p-12 border border-primary/10">
            <Calendar className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-3xl font-bold">พร้อมที่จะเริ่มต้นแล้วหรือยัง?</h2>
            <p className="text-lg text-muted-foreground">
              สมัครสมาชิกวันนี้และอย่าพลาดคอนเสิร์ตฟรีอีกต่อไป
            </p>
            <Button size="lg" className="text-base" asChild>
              <Link href="/signup">
                ลงทะเบียนเลย
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 FreeConcert. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
