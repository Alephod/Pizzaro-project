import { NextResponse } from 'next/server'

import { transporter } from '@/lib/nodemailer'
import { prisma } from '@/lib/prisma'

import type { NextRequest } from 'next/server'

const getEmailHtml = (code: string) => `
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Pizzaro — код входа</title>
  </head>

  <body style="margin:0;padding:0;background:#fafafa;font-family:Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:40px 0;background:#fafafa;">
      <tr>
        <td align="center">

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:15px;overflow:hidden;">
            
            <tr>
              <td style="padding:32px 24px;text-align:center;">
                <h1>Pizzaro</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 32px 32px;color:#171717;text-align:left;">

                <h2 style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#171717;">
                  Ваш код для входа
                </h2>

                <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#171717;">
                  Он действует 5 минут.
                </p>

                <div style="
                  font-size:38px;
                  font-weight:bold;
                  text-align:center;
                  letter-spacing:8px;
                  padding:22px;
                  border-radius:15px;
                  border:2px dashed #fe782b;
                  background:#fafafa;
                  color:#171717;
                  margin-bottom:32px;
                ">
                  ${code}
                </div>

                <p style="margin:0;text-align:center;font-size:12px;color:#b1b1b1;">
                  Если вы не запрашивали код — просто проигнорируйте письмо.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email ?? '').trim().toLowerCase()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Неверный email' }, { status: 400 })
    }
    
    // Генерируем код
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 минут

    // Отправляем письмо — сохраняем в БД только после успешной отправки
    try {
      await transporter.sendMail({
        from: `"Pizzaro" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Код входа',
        text: `Ваш код: ${code}\nДействителен 5 минут.`,
        html: getEmailHtml(code),
      })
    } catch {
      return NextResponse.json({ error: 'Ошибка отправки email' }, { status: 500 })
    }

    // Успешно отправлено — сохраняем/обновляем код в базе
    try {
      await prisma.otpCode.upsert({
        where: { email },
        update: { code, expiresAt },
        create: { email, code, expiresAt },
      })
    } catch {
      return NextResponse.json({ error: 'Ошибка базы данных' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Код отправлен' })
  } catch {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
