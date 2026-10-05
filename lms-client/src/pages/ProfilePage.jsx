import { Card, CardContent, Typography, Button, Avatar, Divider, TextField } from '@mui/material'
import { Person, Email, Lock, Edit, Save } from '@mui/icons-material'
import Navbar from '../components/Navbar'

export default function ProfilePage() {
    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='mb-6'>
                        <Typography variant='h4' className='!font-bold !text-slate-800'>
                            My Profile
                        </Typography>

                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                            Manage your account information and profile settings
                        </Typography>
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <CardContent className='!p-6'>
                            <div className='flex flex-col sm:flex-row sm:items-center gap-5'>
                                <Avatar sx={{ width: 88, height: 88, fontSize: 32 }} className='!bg-blue-600'>
                                    A
                                </Avatar>

                                <div className='flex-1'>
                                    <Typography variant='h5' className='!font-bold !text-slate-800'>
                                        Admin User
                                    </Typography>

                                    <Typography variant='body2' className='!text-slate-500'>
                                        admin@edulearn.com
                                    </Typography>

                                    <div className='mt-2'>
                                        <span className='inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold'>
                                            Administrator
                                        </span>
                                    </div>
                                </div>

                                <Button variant='outlined' startIcon={<Edit />} className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'>
                                    Edit Profile
                                </Button>
                            </div>

                            <Divider className='!my-6' />

                            <div className='mb-6'>
                                <Typography variant='h6' className='!font-bold !text-slate-800'>
                                    Personal Information
                                </Typography>

                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                    Update your personal account information
                                </Typography>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                <TextField fullWidth label="First Name" defaultValue="Admin" InputProps={{ startAdornment: (<Person className='!text-slate-400 !mr-2' />) }} />
                                <TextField fullWidth label="Last Name" defaultValue="User" InputProps={{ startAdornment: (<Person className='!text-slate-400 !mr-2' />) }} />
                                <TextField fullWidth label="Username" defaultValue="admin" />
                                <TextField fullWidth label="Email Address" defaultValue="admin@edulearn.com" type='email' InputProps={{ startAdornment: (<Email className='!text-slate-400 !mr-2' />) }} />
                            </div>

                            <div className='flex justify-end mt-6'>
                                <Button variant='contained' startIcon={<Save />} className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'>
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mt-6'>
                        <CardContent className='!p-6'>
                            <div className='flex items-start gap-3 mb-6'>
                                <div className='w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center'>
                                    <Lock />
                                </div>

                                <div>
                                    <Typography variant='h6' className='!font-bold !text-slate-800'>
                                        Security
                                    </Typography>
                                    <Typography variant='body2' className='!text-slate-500'>
                                        Manage your account password
                                    </Typography>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                <TextField fullWidth label="Current Password" type='password' />
                                <TextField fullWidth label="New Password" type='password' />
                            </div>

                            <div className='flex justify-end mt-6'>
                                <Button variant='outlined' startIcon={<Lock />} className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'>
                                    Change Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    )
}
