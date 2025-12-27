/**
 * Genera un archivo iCal (.ics) a partir de una lista de eventos
 */
export function generateICal(events: {
    id: string
    title: string
    description?: string
    startDate: Date
    endDate?: Date
    location?: string
    url?: string
}[]) {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ChronoStone//Heritage Management//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ]

    events.forEach(event => {
        ics.push('BEGIN:VEVENT')
        ics.push(`UID:${event.id}@chronostone.com`)
        ics.push(`DTSTAMP:${formatDate(new Date())}`)
        ics.push(`DTSTART:${formatDate(event.startDate)}`)
        if (event.endDate) {
            ics.push(`DTEND:${formatDate(event.endDate)}`)
        } else {
            // Si no hay fin, dura 1 hora
            const end = new Date(event.startDate.getTime() + 60 * 60 * 1000)
            ics.push(`DTEND:${formatDate(end)}`)
        }
        ics.push(`SUMMARY:${event.title}`)
        if (event.description) {
            ics.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`)
        }
        if (event.location) {
            ics.push(`LOCATION:${event.location}`)
        }
        if (event.url) {
            ics.push(`URL:${event.url}`)
        }
        ics.push('END:VEVENT')
    })

    ics.push('END:VCALENDAR')

    return ics.join('\r\n')
}
