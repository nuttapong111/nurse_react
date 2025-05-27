              <TableRow key={payment.id}>
                <TableCell>{payment.referenceId}</TableCell>
                <TableCell>{payment.package.name}</TableCell>
                <TableCell>{payment.amount} บาท</TableCell>
                <TableCell>
                  {payment.proofImage ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}${payment.proofImage}`}
                      alt="หลักฐานการชำระเงิน" 
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(`${import.meta.env.VITE_API_URL}${payment.proofImage}`, '_blank')}
                    />
                  ) : (
                    'ไม่มีหลักฐาน'
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(payment.status)}
                    color={getStatusColor(payment.status)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(payment.createdAt).toLocaleDateString("th-TH")}
                </TableCell>
              </TableRow> 